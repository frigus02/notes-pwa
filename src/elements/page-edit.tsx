import storage, { type Note } from "../shared/storage.js";
import { sync } from "./utils/sync.js";
import { Toolbar } from "./toolbar.js";
import { useLocation, useRoute } from "preact-iso";
import { notes } from "./utils/notes.js";
import { NotFoundPage } from "./page-404.js";

export function EditPage() {
    const { params } = useRoute();
    const location = useLocation();
    const note = notes.value.find((note) => note.path === params["path"]);

    if (!note) {
        return <NotFoundPage />;
    }

    const cancel = () => {
        location.route(`/view/${note.path}`);
    };

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
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
        location.route(`/view/${newNote.path}`);
    };

    return (
        <form class="note-edit" onSubmit={onSubmit}>
            <Toolbar
                title={note.title}
                subTitle={note.title === note.path ? "" : note.path}
            >
                <button onClick={cancel}>Cancel</button>
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
