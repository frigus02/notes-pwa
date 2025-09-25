import { computed, signal, effect } from "@preact/signals";
import storage from "../../shared/storage";
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

effect(() => {
    storage.modified.value;
    sync.lastResult.value;
    storage.getNotes().then((notes) => {
        _notes.value = notes.map<UiNote>((note) => ({
            title: splitNote(note.body)[0] || note.path,
            path: note.path,
            body: note.body,
            modified: note.modified,
            syncState: syncState(note),
        }));
    });
});
