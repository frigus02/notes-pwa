import { makeWebComponent } from "function-web-components";
import { html, render, repeat } from "./notes-base-element.js";

import { splitNote, timeAgo } from "../shared/format.js";
import { type Note } from "../shared/storage.js";

interface Props {
    [key: string]: any;
}

function notesList({ dataNotes }: Props) {
    if (!dataNotes) return;
    return html`
        <style>
            :host {
                display: block;
            }

            .list {
                margin: 0;
                padding: 0;
                list-style-type: none;
            }

            .note-item:not(:last-child) {
                border-bottom: 1px solid var(--divider-color);
            }

            .note-item a {
                color: var(--primary-text-color);
                display: block;
                padding: 8px 16px;
                text-decoration: none;
            }

            .note-item a:hover,
            .note-item a:active {
                background: rgba(0, 0, 0, 0.1);
            }

            .note-item h2 {
                margin: 0;
                font-size: 16px;
                font-weight: normal;
            }

            .note-item a {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .note-item .path,
            .note-item .metadata {
                color: var(--secondary-text-color);
                font-size: small;
            }
        </style>

        <ul class="list">
            ${repeat(
                dataNotes,
                (note: Note) => note.id,
                (note: Note) => html`
                    <li class="note-item">
                        <a href="/note/${note.id}">
                            <div>
                                <h2>${splitNote(note)[0]}</h2>
                                ${note.path !== splitNote(note)[0]
                                    ? html`<span class="path"
                                          >${note.path}</span
                                      >`
                                    : null}
                            </div>
                            <div class="metadata">
                                <div>${timeAgo(note.modified.getTime())}</div>
                                <div>
                                    ${note.lastSync?.body === note.body
                                        ? "synced"
                                        : "modified"}
                                </div>
                            </div>
                        </a>
                    </li>
                `,
            )}
        </ul>
    `;
}

customElements.define(
    "notes-list",
    makeWebComponent(notesList, {
        props: ["dataNotes"],
        render,
    }),
);
