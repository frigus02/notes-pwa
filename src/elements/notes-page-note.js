import NotesBaseElement, { html, until } from "./notes-base-element.js";
import "./notes-details-edit.js";
import "./notes-details.js";
import "./notes-toolbar.js";
import router from "./utils/router.js";

import storage from "../shared/storage.js";

class NotesPageNote extends NotesBaseElement {
    static get is() {
        return "notes-page-note";
    }

    static get properties() {
        return {
            dataState: Object,
            dataEdit: Boolean
        };
    }

    constructor() {
        super();
        this._editNote = this._editNote.bind(this);
        this._deleteNote = this._deleteNote.bind(this);
    }

    _editNote() {
        this.dataEdit = !this.dataEdit;
    }

    async _deleteNote() {
        await storage.deleteNote(this.dataState.noteId);
        router.navigate("/");
    }

    render({ dataState, dataEdit }) {
        const noteDetails = storage.getNote(dataState.noteId).then(note => {
            const onChange = async e => {
                const updatedNote = e.detail;
                await storage.updateNote(updatedNote);
            };

            return dataEdit
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
                <button slot="actions" @click="${this._editNote}">Edit</button>
                <button slot="actions" @click="${this._deleteNote}">
                    Delete
                </button>
            </notes-toolbar>
            ${until(noteDetails, "Loading...")}
        `;
    }
}

customElements.define(NotesPageNote.is, NotesPageNote);
