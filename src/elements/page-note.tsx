import storage, { type Note } from "../shared/storage.js";
import { splitNote } from "../shared/format.js";
import { sync } from "./utils/worker.js";
import { useLocation, useRoute } from "preact-iso";
import { Toolbar } from "./toolbar.js";
import { useEffect, useState } from "preact/hooks";
import { NoteMetadata } from "./note-metadata.js";
import { NoteMarkdown } from "./note-markdown.js";

export function NotePage() {
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

    const editNote = () => {
        location.route(`/note/${note.id}/edit`);
    };
    const deleteNote = async () => {
        if (confirm("Delete note?")) {
            await storage.deleteNote(note.id);
            sync.one(await storage.getNote(note.id), undefined);
            location.route("/");
        }
    };

    const [title, body] = splitNote(note);

    return (
        <div class="note-details">
            <Toolbar
                title={title}
                subTitle={note.path === title ? "" : note.path}
            >
                <button onClick={editNote}>Edit</button>
                <button onClick={deleteNote}>Delete</button>
            </Toolbar>
            <div class="content">
                <NoteMetadata note={note}></NoteMetadata>
                <NoteMarkdown value={body}></NoteMarkdown>
            </div>
        </div>
    );
}
