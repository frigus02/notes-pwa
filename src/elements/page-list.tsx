import { sync } from "./utils/sync.js";
import storage from "../shared/storage.js";
import { Toolbar } from "./toolbar.js";
import { useLocation } from "preact-iso";
import { NotesList } from "./notes-list.js";
import { useQuery } from "./utils/use-query.js";
import { useSettingsDialog, SettingsDialog } from "./settings-dialog.js";

export function ListPage() {
    const notes = useQuery(() => storage.getNotes(), []);
    const location = useLocation();

    if (notes === undefined) {
        return <Toolbar title="Notes" />;
    }

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
            <NotesList notes={notes} />
        </>
    );
}
