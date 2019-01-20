import { makeWebComponent, useState } from "function-web-components";
import { html, render, until } from "./notes-base-element.js";
import "./notes-details-edit.js";
import "./notes-details.js";
import "./notes-toolbar.js";
import router from "./utils/router.js";

import storage from "../shared/storage.js";

function useToggleState(initialValue) {
    const [value, setValue] = useState(initialValue);
    const toggle = () => {
        setValue(!value);
    };

    return [value, toggle];
}

function notesPageNote({ dataState }) {
    const [isEditing, toggleIsEditing] = useToggleState(false);

    const deleteNote = async () => {
        await storage.deleteNote(dataState.noteId);
        router.navigate("/");
    };

    const noteDetails = storage.getNote(dataState.noteId).then(note => {
        const onChange = async e => {
            const updatedNote = e.detail;
            await storage.updateNote(updatedNote);
        };

        return isEditing
            ? html`
                  <notes-details-edit
                      .dataNote="${note}"
                      @change="${onChange}"
                  ></notes-details-edit>
              `
            : html`
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

            notes-details,
            notes-details-edit {
                margin-top: 59px;
                flex: 1;
            }
        </style>

        <notes-toolbar>
            Notes
            <button slot="actions" @click="${toggleIsEditing}">Edit</button>
            <button slot="actions" @click="${deleteNote}">Delete</button>
        </notes-toolbar>
        ${until(noteDetails, "Loading...")}
    `;
}

customElements.define(
    "notes-page-note",
    makeWebComponent(notesPageNote, {
        props: ["dataState"],
        render
    })
);
