import storage from "../shared/storage.js";
import { splitNote } from "../shared/format.js";
import { sync } from "./utils/sync.js";
import { useLocation, useRoute } from "preact-iso";
import { Toolbar } from "./toolbar.js";
import { NoteMetadata } from "./note-metadata.js";
import { NoteMarkdown } from "./note-markdown.js";
import { notes } from "./utils/notes.js";
import { NotFoundPage } from "./page-404.js";
import { SettingsDialogContent } from "./settings-dialog.js";
import { Dialog, useDialog } from "./utils/dialog.js";
import { ListDialogContent } from "./list-dialog.js";

export function NotePage() {
    const { params } = useRoute();
    const location = useLocation();
    const path = params["path"] ?? "README.md";
    const note = notes.value.find((note) => note.path === path);

    if (!note) {
        return <NotFoundPage />;
    }

    const syncNotes = () => {
        sync.all();
    };

    const createNote = async () => {
        const note = await storage.createNote();
        location.route(`/view/${note.path}`);
    };

    const [settingsDialogProps, openSettings] = useDialog();
    const [listDialogProps, openList] = useDialog();

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
            <Toolbar
                title={note.title}
                subTitle={note.title === note.path ? "" : note.path}
            >
                <button onClick={syncNotes}>Sync</button>
                <button onClick={createNote}>New note</button>
                <button onClick={openList}>All</button>
                <button onClick={openSettings}>Settings</button>
                <button onClick={editNote}>Edit</button>
                <button onClick={deleteNote}>Delete</button>
            </Toolbar>
            <div class="content">
                <NoteMetadata note={note}></NoteMetadata>
                <NoteMarkdown value={body}></NoteMarkdown>
            </div>
            <Dialog {...listDialogProps}>
                <ListDialogContent />
            </Dialog>
            <Dialog {...settingsDialogProps}>
                <SettingsDialogContent />
            </Dialog>
        </div>
    );
}
