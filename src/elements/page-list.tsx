import { sync } from "./utils/worker.js";
import storage, { type Note } from "../shared/storage.js";
import { useEffect, useState } from "preact/hooks";
import { Toolbar } from "./toolbar.js";
import { useLocation } from "preact-iso";
import { NotesList } from "./notes-list.js";

export function ListPage() {
    const [notes, setNotes] = useState<Note[]>();
    useEffect(() => {
        storage.getNotes().then((notes) => {
            setNotes(notes);
        });
    }, []);
    const location = useLocation();

    if (notes === undefined) {
        return <Toolbar title="Notes" />;
    }

    const syncNotes = () => {
        sync.all();
    };

    const createNote = async () => {
        const note = await storage.createNote();
        location.route(`/note/${note.id}`);
    };

    const openSettings = () => {
        location.route("/settings");
    };

    return (
        <>
            <Toolbar title="Notes">
                <button onClick={syncNotes}>Sync</button>
                <button onClick={createNote}>New note</button>
                <button onClick={openSettings}>Settings</button>
            </Toolbar>
            <NotesList notes={notes} />
        </>
    );
}
