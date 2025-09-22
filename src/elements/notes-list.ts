import { makeWebComponent } from "function-web-components";
import { html, render, repeat } from "./notes-base-element.js";

import { timeAgo } from "../shared/format.js";
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

            .note-item p {
                margin: 0;
                color: var(--secondary-text-color);
                display: flex;
                white-space: nowrap;
                justify-content: space-between;
            }

            .note-item p .summary {
                overflow: hidden;
                text-overflow: ellipsis;
            }
        </style>

        <ul class="list">
            ${repeat(
                dataNotes,
                (note: Note) => note.id,
                (note: Note) => html`
                    <li class="note-item">
                        <a href="/note/${note.id}">
                            <h2>${note.title}</h2>
                            <p>
                                <span class="summary">${note.body}</span>
                                <span>${timeAgo(note.modified.getDate())}</span>
                            </p>
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
