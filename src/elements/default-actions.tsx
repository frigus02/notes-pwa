import storage from "../shared/storage.js";
import { sync } from "./utils/sync.js";
import { SettingsDialogContent } from "./settings-dialog.js";
import { Dialog, useDialog } from "./utils/dialog.js";
import { ListDialogContent } from "./list-dialog.js";
import { open } from "./utils/path.js";
import { IconButton } from "./icon-button.js";

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
            <IconButton icon="sync" onClick={syncNotes} />
            <IconButton icon="add" onClick={createNote} />
            <IconButton icon="list" onClick={openList} />
            <IconButton icon="settings" onClick={openSettings} />
            <Dialog {...listDialogProps}>
                <ListDialogContent />
            </Dialog>
            <Dialog {...settingsDialogProps}>
                <SettingsDialogContent />
            </Dialog>
        </>
    );
}
