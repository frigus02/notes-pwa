import storage from "../shared/storage.js";
import { splitNote } from "../shared/format.js";
import { sync } from "./utils/sync.js";
import { useLocation, useRoute } from "preact-iso";
import { Toolbar } from "./toolbar.js";
import { NoteMetadata } from "./note-metadata.js";
import { NoteMarkdown } from "./note-markdown.js";
import { useQuery } from "./utils/use-query.js";

export function NotePage() {
    const { params } = useRoute();
    const location = useLocation();
    const note = useQuery(
        () => storage.getNote(params["path"]),
        [params["path"]],
    );

    if (!note) {
        return <Toolbar title="Note" />;
    }

    const editNote = () => {
        location.route(`/edit/${note.path}`);
    };
    const deleteNote = async () => {
        if (confirm("Delete note?")) {
            await storage.deleteNote(note.path);
            sync.one(await storage.getNote(note.path), undefined);
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
