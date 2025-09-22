import { makeWebComponent } from "function-web-components";
import { html, render } from "./notes-base-element.js";
import "./notes-markdown-editor.js";

import { timeAgo } from "../shared/format.js";
import type { Note } from "../shared/storage.js";

interface Props {
    [key: string]: any;
}

function notesDetailsEdit({ dataNote, setDataNote }: Props) {
    if (!dataNote) return;

    const onChange = (changedProps: Partial<Note>) => {
        const newDataNote: Note = Object.assign({}, dataNote, changedProps);
        setDataNote(newDataNote, { eventName: "change" });
    };

    return html`
        <style>
            :host {
                display: flex;
                flex-direction: column;
                padding: 8px 16px;
            }

            h2 {
                margin: 0 0 4px;
            }

            h2 input {
                border: none;
                border-bottom: 1px solid var(--divider-color);
                font-size: 18px;
                padding: 1px;
                width: 100%;
            }

            .metadata {
                color: var(--secondary-text-color);
                font-size: 12px;
                margin-bottom: 16px;
            }

            notes-markdown-editor {
                flex: 1;
            }
        </style>

        <h2>${dataNote.title}</h2>
        <div class="metadata">
            Modified: ${timeAgo(dataNote.modified.getTime())}
        </div>
        <notes-markdown-editor
            aria-label="Note content"
            .value="${dataNote.body}"
            @change="${(e: CustomEvent) => onChange({ body: e.detail })}"
        ></notes-markdown-editor>
    `;
}

customElements.define(
    "notes-details-edit",
    makeWebComponent(notesDetailsEdit, {
        props: ["dataNote"],
        render,
    }),
);
