import { makeWebComponent } from "function-web-components";
import { html, render, until } from "./notes-base-element.js";
import "./notes-toolbar.js";
import router from "./utils/router.js";

import storage from "../shared/storage.js";
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
            await storage.updateNote({
                ...note,
                body: (data.get("body") as string | null) ?? "",
            });
            sync.one(await storage.getNote(note.id));
            router.navigate(`/note/${dataState.noteId}`);
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
                <textarea
                    aria-label="Note content"
                    name="body"
                    .value="${note.body}"
                ></textarea>
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

            textarea {
                margin-top: 59px;
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
