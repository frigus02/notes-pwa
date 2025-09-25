import storage from "../shared/storage.js";
import { splitNote } from "../shared/format.js";
import { sync } from "./utils/sync.js";
import { useLocation, useRoute } from "preact-iso";
import { Toolbar } from "./toolbar.js";
import { NoteMetadata } from "./note-metadata.js";
import { NoteMarkdown } from "./note-markdown.js";
import { notes } from "./utils/notes.js";
import { NotFoundPage } from "./page-404.js";
import { DefaultActions } from "./default-actions.js";

export function NotePage() {
    const { params } = useRoute();
    const location = useLocation();
    const note =
        notes.value.find((note) => note.path === params["path"]) ??
        notes.value.find((note) => note.path === "README.md") ??
        notes.value.find((note) => note.path === "hello.md");

    if (!note) {
        return <NotFoundPage />;
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

    const [_title, body] = splitNote(note.body);

    return (
        <div class="note-details">
            <Toolbar title={note.title} subTitle={note.path}>
                <DefaultActions />
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
