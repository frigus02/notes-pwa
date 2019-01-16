import NotesBaseElement, { html, until } from "./notes-base-element.js";
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
            dataState: Object
        };
    }

    constructor() {
        super();
        this._deleteNote = this._deleteNote.bind(this);
    }

    async _deleteNote() {
        await storage.deleteNote(this.dataState.noteId);
        router.navigate("/");
    }

    render({ dataState }) {
        const noteDetails = storage.getNote(dataState.noteId).then(note => {
            const onChange = async e => {
                const updatedNote = e.detail;
                await storage.updateNote(updatedNote);
            };

            return html`
                <notes-details
                    .dataNote="${note}"
                    @change="${onChange}"
                ></notes-details>
            `;
        });

        return html`
            <style>
                :host {
                    display: block;
                }
            </style>

            <notes-toolbar>
                Notes
                <button slot="actions" @click="${this._deleteNote}">
                    Delete
                </button>
            </notes-toolbar>
            ${until(noteDetails, "Loading...")}
        `;
    }
}

customElements.define(NotesPageNote.is, NotesPageNote);
