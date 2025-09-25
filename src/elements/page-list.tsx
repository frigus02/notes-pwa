import { sync } from "./utils/sync.js";
import storage from "../shared/storage.js";
import { Toolbar } from "./toolbar.js";
import { useLocation } from "preact-iso";
import { useSettingsDialog, SettingsDialog } from "./settings-dialog.js";
import { notes } from "./utils/notes.js";
import { timeAgo } from "../shared/format.js";

export function ListPage() {
    const location = useLocation();

    const syncNotes = () => {
        sync.all();
    };

    const createNote = async () => {
        const note = await storage.createNote();
        location.route(`/view/${note.path}`);
    };

    const [settingsDialogProps, openSettings] = useSettingsDialog();

    return (
        <>
            <Toolbar title="Notes">
                <button onClick={syncNotes}>Sync</button>
                <button onClick={createNote}>New note</button>
                <button onClick={openSettings}>Settings</button>
                <SettingsDialog {...settingsDialogProps} />
            </Toolbar>
            <ul class="notes-list">
                {notes.value.map((note) => (
                    <li class="note-item" key={note.path}>
                        <a href={`/view/${note.path}`}>
                            <div>
                                <h2>{note.title}</h2>
                                {note.path !== note.title ? (
                                    <span class="path">{note.path}</span>
                                ) : null}
                            </div>
                            <div class="metadata">
                                <div>{timeAgo(note.modified.getTime())}</div>
                                <div>{note.syncState}</div>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>
        </>
    );
}
