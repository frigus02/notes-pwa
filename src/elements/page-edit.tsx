import storage, { type Note } from "../shared/storage.js";
import { splitNote } from "../shared/format.js";
import { sync } from "./utils/worker.js";
import { Toolbar } from "./toolbar.js";
import { useEffect, useState } from "preact/hooks";
import { useLocation, useRoute } from "preact-iso";

export function EditPage() {
    const { params } = useRoute();
    const location = useLocation();
    const [note, setNote] = useState<Note>();
    useEffect(() => {
        storage.getNote(params["id"]).then((note) => {
            setNote(note);
        });
    }, [params]);

    if (!note) {
        return <Toolbar title="Note" />;
    }

    const cancel = () => {
        location.route(`/note/${note.id}`);
    };

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
        location.route(`/note/${newNote.id}`);
    };

    const [title] = splitNote(note);

    return (
        <form class="note-edit" onSubmit={onSubmit}>
            <Toolbar
                title={title}
                subTitle={note.path === title ? "" : note.path}
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
