import storage from "../shared/storage.js";
import { sync } from "./utils/sync.js";
import { SettingsDialogContent } from "./settings-dialog.js";
import { Dialog, useDialog } from "./utils/dialog.js";
import { ListDialogContent } from "./list-dialog.js";
import { open } from "./utils/path.js";

export function DefaultActions() {
    const syncNotes = () => {
        sync.all();
    };

    const createNote = async () => {
        const note = await storage.createNote();
        open(note);
    };

    const [settingsDialogProps, openSettings] = useDialog();
    const [listDialogProps, openList] = useDialog();

    return (
        <>
            <button onClick={syncNotes}>Sync</button>
            <button onClick={createNote}>New note</button>
            <button onClick={openList}>All</button>
            <button onClick={openSettings}>Settings</button>
            <Dialog {...listDialogProps}>
                <ListDialogContent />
            </Dialog>
            <Dialog {...settingsDialogProps}>
                <SettingsDialogContent />
            </Dialog>
        </>
    );
}
