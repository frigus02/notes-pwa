import { type Note } from "../shared/storage.js";
import { notes, type UiNote } from "./utils/notes.js";
import { NotFound } from "./not-found.js";
import { useState } from "preact/hooks";
import { path, open } from "./utils/path.js";
import { ViewNote } from "./view-note.js";
import { lazy } from "./utils/lazy.js";

function getNote() {
    const p = path.value;
    if (!p) return undefined;

    if (p.type === "note") {
        if (p.value === "") {
            return (
                notes.value.find((note) => note.path === "README.md") ??
                notes.value.find((note) => note.path === "hello.md")
            );
        }

        return notes.value.find((note) => note.path === p.value);
    }

    if (p.value === "new") {
        return {
            title: "New note",
            path: "new.md",
            body: "",
            modified: new Date(),
            syncState: "new",
        } satisfies UiNote;
    }

    return undefined;
}

const EditNote = lazy(() => import("./edit-note.js").then((m) => m.EditNote));

export function Note() {
    const note = getNote();
    if (!note) {
        return <NotFound />;
    }

    const [isEditing, setIsEditing] = useState(false);
    if (isEditing || note.syncState === "new") {
        return (
            <EditNote
                note={note}
                onView={(newNote) => {
                    setIsEditing(false);
                    open(newNote);
                }}
            />
        );
    }

    return <ViewNote note={note} onEdit={() => setIsEditing(true)} />;
}
