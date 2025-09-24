import { makeWebComponent } from "function-web-components";
import { html, render, until } from "./notes-base-element.js";
import "./notes-details.js";
import "./notes-toolbar.js";
import router from "./utils/router.js";

import storage from "../shared/storage.js";
import { splitNote } from "../shared/format.js";
import { sync } from "./utils/worker.js";

interface Props {
    [key: string]: any;
}

function notesPageNote({ dataState }: Props) {
    const editNote = () => {
        router.navigate(`/note/${dataState.noteId}/edit`);
    };
    const deleteNote = async () => {
        if (confirm("Delete note?")) {
            await storage.deleteNote(dataState.noteId);
            sync.one(await storage.getNote(dataState.noteId), undefined);
            router.navigate("/");
        }
    };

    const result = storage.getNote(dataState.noteId).then((note) => {
        const noteTitle = splitNote(note)[0];
        return html`
            <notes-toolbar>
                ${noteTitle}
                ${note.path !== noteTitle
                    ? html`<span slot="sub">${note.path}</span>`
                    : null}
                <button slot="actions" @click="${editNote}">Edit</button>
                <button slot="actions" @click="${deleteNote}">Delete</button>
            </notes-toolbar>
            <notes-details .dataNote="${note}"></notes-details>
        `;
    });

    return html`
        <style>
            :host {
                display: flex;
                flex-direction: column;
                min-height: 100vh;
            }

            notes-toolbar {
                position: fixed;
            }

            notes-details {
                margin-top: 59px;
                flex: 1;
            }
        </style>

        ${until(result, html`<notes-toolbar>Loading...</notes-toolbar>`)}
    `;
}

customElements.define(
    "notes-page-note",
    makeWebComponent(notesPageNote, {
        props: ["dataState"],
        render,
    }),
);
