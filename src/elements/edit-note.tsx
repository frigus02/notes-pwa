import type { JSX } from "preact/jsx-runtime";
import storage, { type Note } from "../shared/storage.js";
import { sync } from "./utils/sync.js";
import { Toolbar } from "./toolbar.js";
import { type UiNote } from "./utils/notes.js";
import { IconButton } from "./icon-button.js";
import { Editor } from "./editor.js";

export interface Props {
    note: UiNote;
    onView: (newNote: Note | UiNote | undefined) => void;
}

export function EditNote({ note, onView }: Props) {
    const onCancel = () => {
        onView(note.syncState === "new" ? undefined : note);
    };
    const onSubmit = async (e: JSX.TargetedSubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const body = (data.get("body") as string | null) ?? "";
        const path = (data.get("path") as string | null) ?? "";
        let newNote: Note;
        if (note.syncState === "new") {
            newNote = await storage.createNote({
                path,
                body,
            });
            sync.one(newNote, undefined);
        } else if (path !== note.path) {
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
        onView(newNote);
    };

    return (
        <form class="note-edit" onSubmit={onSubmit}>
            <Toolbar title={note.title} subTitle={note.path}>
                <IconButton icon="cancel" onClick={onCancel} />
                <IconButton icon="save" type="submit" />
            </Toolbar>
            <div class="fields">
                <label>
                    Path: <input name="path" defaultValue={note.path} />
                </label>
                <Editor name="body" defaultValue={note.body} />
            </div>
        </form>
    );
}
