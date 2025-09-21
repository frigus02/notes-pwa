import { makeWebComponent } from "function-web-components";
import { html, render, until } from "./notes-base-element.js";
import "./notes-list.js";
import "./notes-toolbar.js";
import router from "./utils/router.js";
import sync from "./utils/sync.js";

import storage from "../shared/storage.js";

function notesPageList() {
    const notesList = storage
        .getNotes()
        .then(
            (notes) => html` <notes-list .dataNotes="${notes}"></notes-list> `,
        );

    const syncNotes = async () => {
        try {
            await sync.sync();
            alert("Sync done :-)");
        } catch (e) {
            console.log(e);
            alert("Sync error :-(\nSee console for details.");
        }
    };

    const createNote = async () => {
        const note = await storage.createNote();
        router.navigate(`/note/${note.id}`);
    };

    // TODO: call when connected
    // if (sync.continueSync()) {
    //    this._syncNotes();
    // }

    return html`
        <style>
            :host {
                display: block;
            }
        </style>

        <notes-toolbar>
            Notes <button slot="actions" @click="${syncNotes}">Sync</button>
            <button slot="actions" @click="${createNote}">New note</button>
        </notes-toolbar>
        ${until(notesList, "Loading...")}
    `;
}

customElements.define(
    "notes-page-list",
    makeWebComponent(notesPageList, {
        render,
    }),
);
