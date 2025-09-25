import { computed, signal, effect } from "@preact/signals";
import storage, { type Note } from "../../shared/storage";
import { sync } from "./sync.js";
import { splitNote, syncState } from "../../shared/format.js";

export interface UiNote {
    readonly title: string;
    readonly path: string;
    readonly body: string;
    readonly modified: Date;
    readonly syncState: string;
}

const _notes = signal<UiNote[]>([]);
export const notes = computed(() => _notes.value);

function getTitle(note: Note) {
    const fromBody = splitNote(note.body)[0];
    if (fromBody) {
        return fromBody;
    }

    return note.path.substring(
        note.path.lastIndexOf("/") + 1,
        note.path.lastIndexOf("."),
    );
}

effect(() => {
    storage.modified.value;
    sync.lastResult.value;
    storage.getNotes().then((notes) => {
        _notes.value = notes.map<UiNote>((note) => ({
            title: getTitle(note),
            path: note.path,
            body: note.body,
            modified: note.modified,
            syncState: syncState(note),
        }));
    });
});
