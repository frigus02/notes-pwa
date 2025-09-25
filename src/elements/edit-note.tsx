import type { JSX } from "preact/jsx-runtime";
import storage, { type Note } from "../shared/storage.js";
import { sync } from "./utils/sync.js";
import { Toolbar } from "./toolbar.js";
import { type UiNote } from "./utils/notes.js";

export interface Props {
    note: UiNote;
    onView: () => void;
}

export function EditNote({ note, onView }: Props) {
    const onSubmit = async (e: JSX.TargetedSubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const body = (data.get("body") as string | null) ?? "";
        const path = (data.get("path") as string | null) ?? "";
        let newNote: Note;
        if (path !== note.path) {
            await storage.deleteNote(note.path);
            newNote = await storage.createNote({
                path,
                body,
            });
            sync.one(newNote, await storage.getNote(note.path));
        } else {
            newNote = await storage.getNote(note.path);
            newNote.body = body;
            await storage.updateNote(newNote);
            newNote = await storage.getNote(note.path);
            sync.one(newNote, undefined);
        }
        onView();
    };

    return (
        <form class="note-edit" onSubmit={onSubmit}>
            <Toolbar title={note.title} subTitle={note.path}>
                <button onClick={onView}>Cancel</button>
                <button type="submit">Save</button>
            </Toolbar>
            <div class="fields">
                <label>
                    Path:
                    <input name="path" defaultValue={note.path} />
                </label>
                <textarea
                    aria-label="Note content"
                    name="body"
                    defaultValue={note.body}
                ></textarea>
            </div>
        </form>
    );
}
