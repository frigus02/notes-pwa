import { computed, signal } from "@preact/signals";
import type { UiNote } from "./notes";
import type { Note } from "../../shared/storage";

function getPath() {
    return decodeURI(window.location.hash.substring(2));
}

const _path = signal(getPath());

window.addEventListener("hashchange", () => {
    _path.value = getPath();
});

export const path = computed(() => _path.value);

export function open(note: Note | UiNote | undefined) {
    if (note) {
        window.location.href = "#/" + note.path;
    } else {
        window.location.href = "#/";
    }
}
