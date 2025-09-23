import { makeWebComponent, useState } from "function-web-components";
import { html, render, until } from "./notes-base-element.js";
import "./notes-details-edit.js";
import "./notes-details.js";
import "./notes-toolbar.js";
import router from "./utils/router.js";

import storage, { type Note } from "../shared/storage.js";
import { splitNote } from "../shared/format.js";

interface Props {
    [key: string]: any;
}

function notesPageNote({ dataState }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedNote, setEditedNote] = useState<Note | null>(null);

    const edit = () => setIsEditing(true);
    const deleteNote = async () => {
        await storage.deleteNote(dataState.noteId);
        router.navigate("/");
    };

    const result = storage.getNote(dataState.noteId).then((note) => {
        const cancel = () => {
            setIsEditing(false);
            setEditedNote(null);
        };
        const save = async () => {
            setIsEditing(false);
            if (editedNote) {
                await storage.updateNote(editedNote);
            }
            window.location.reload();
        };
        const noteTitle = splitNote(editedNote ?? note)[0];
        return html`
            <notes-toolbar>
                ${noteTitle}
                ${isEditing
                    ? html`<button slot="actions" @click="${cancel}">
                              Cancel
                          </button>
                          <button slot="actions" @click="${save}">Save</button>`
                    : html`<button slot="actions" @click="${edit}">Edit</button>
                          <button slot="actions" @click="${deleteNote}">
                              Delete
                          </button>`}
            </notes-toolbar>
            ${isEditing
                ? html`
                      <notes-details-edit
                          .dataNote="${editedNote ?? note}"
                          @change="${(e: CustomEvent) =>
                              setEditedNote(e.detail)}"
                      ></notes-details-edit>
                  `
                : html` <notes-details .dataNote="${note}"></notes-details> `}
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

            notes-details,
            notes-details-edit {
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
