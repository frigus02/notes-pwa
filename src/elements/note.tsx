import { type Note } from "../shared/storage.js";
import { notes } from "./utils/notes.js";
import { NotFound } from "./not-found.js";
import { useState } from "preact/hooks";
import { path } from "./utils/path.js";
import { ViewNote } from "./view-note.js";
import { EditNote } from "./edit-note.js";

export function Note() {
    const note =
        notes.value.find((note) => note.path === path.value) ??
        notes.value.find((note) => note.path === "README.md") ??
        notes.value.find((note) => note.path === "hello.md");

    if (!note) {
        return <NotFound />;
    }

    const [isEditing, setIsEditing] = useState(false);
    if (isEditing) {
        return <EditNote note={note} onView={() => setIsEditing(false)} />;
    }

    return <ViewNote note={note} onEdit={() => setIsEditing(true)} />;
}
