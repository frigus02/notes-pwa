import { makeWebComponent } from "function-web-components";
import { html, render, until } from "./notes-base-element.js";
import "./notes-toolbar.js";
import router from "./utils/router.js";

import storage, { type Note } from "../shared/storage.js";
import { splitNote } from "../shared/format.js";
import { sync } from "./utils/worker.js";

interface Props {
    [key: string]: any;
}

function notesPageEdit({ dataState }: Props) {
    const cancel = () => {
        router.navigate(`/note/${dataState.noteId}`);
    };

    const result = storage.getNote(dataState.noteId).then((note) => {
        const onSubmit = async (e: SubmitEvent) => {
            e.preventDefault();
            const data = new FormData(e.target as HTMLFormElement);
            const body = (data.get("body") as string | null) ?? "";
            const path = (data.get("path") as string | null) ?? "";
            let newNote: Note;
            if (path !== note.path) {
                await storage.deleteNote(note.id);
                newNote = await storage.createNote({
                    ...note,
                    body,
                    path,
                    lastSync: undefined,
                });
                sync.one(newNote, note);
            } else {
                await storage.updateNote({ ...note, body });
                newNote = await storage.getNote(note.id);
                sync.one(newNote, undefined);
            }
            router.navigate(`/note/${newNote.id}`);
        };

        const noteTitle = splitNote(note)[0];
        return html`
            <form @submit="${onSubmit}">
                <notes-toolbar>
                    ${noteTitle}
                    ${note.path !== noteTitle
                        ? html`<span slot="sub">${note.path}</span>`
                        : null}
                    <button slot="actions" @click="${cancel}">Cancel</button>
                    <button slot="actions" type="submit">Save</button>
                </notes-toolbar>
                <div class="fields">
                    <label>
                        Path:
                        <input name="path" .value="${note.path}" />
                    </label>
                    <textarea
                        aria-label="Note content"
                        name="body"
                        .value="${note.body}"
                    ></textarea>
                </div>
            </form>
        `;
    });

    return html`
        <style>
            :host {
                display: block;
            }

            form {
                display: flex;
                flex-direction: column;
                min-height: 100vh;
            }

            notes-toolbar {
                position: fixed;
            }

            .fields {
                margin-top: 59px;
                flex: 1;
                display: flex;
                flex-direction: column;
            }

            label {
                display: flex;
                align-items: center;
            }

            input {
                flex: 1;
            }

            textarea {
                flex: 1;
                resize: none;
                box-sizing: border-box;
            }
        </style>

        ${until(result, html`<notes-toolbar>Loading...</notes-toolbar>`)}
    `;
}

customElements.define(
    "notes-page-edit",
    makeWebComponent(notesPageEdit, {
        props: ["dataState"],
        render,
    }),
);
