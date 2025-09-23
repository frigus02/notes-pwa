import { makeWebComponent } from "function-web-components";
import { html, render, until } from "./notes-base-element.js";
import "./notes-list.js";
import "./notes-toolbar.js";
import router from "./utils/router.js";
import { sync } from "./utils/worker.js";

import storage from "../shared/storage.js";

function notesPageList() {
    const notesList = storage
        .getNotes()
        .then(
            (notes) => html` <notes-list .dataNotes="${notes}"></notes-list> `,
        );

    const syncNotes = async () => {
        try {
            await sync({
                dryRun: true,
            });
            alert("Sync done :-)");
        } catch (e) {
            console.error(e);
            alert("Sync failed. Look in the console for details.");
        }
    };

    const createNote = async () => {
        const note = await storage.createNote();
        router.navigate(`/note/${note.id}`);
    };

    const openSettings = () => {
        router.navigate("/settings");
    };

    return html`
        <style>
            :host {
                display: block;
            }
        </style>

        <notes-toolbar>
            Notes <button slot="actions" @click="${syncNotes}">Sync</button>
            <button slot="actions" @click="${createNote}">New note</button>
            <button slot="actions" @click="${openSettings}">Settings</button>
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
