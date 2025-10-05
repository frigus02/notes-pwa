import { computed, signal } from "@preact/signals";
import type { UiNote } from "./notes";
import type { Note } from "../../shared/storage";

interface Path {
    type: "note" | "special";
    value: string;
}

function getPath(): Path {
    const hash = window.location.hash.substring(1);
    if (!hash) return { type: "note", value: "" };
    if (hash.startsWith("/")) {
        return {
            type: "note",
            value: decodeURI(hash.substring(1)),
        };
    }
    return {
        type: "special",
        value: hash,
    };
}

const _path = signal(getPath());

window.addEventListener("hashchange", () => {
    _path.value = getPath();
});

export const path = computed(() => _path.value);

export function open(note: Note | UiNote | "new" | undefined) {
    if (note === "new") {
        window.location.href = "#" + note;
    } else if (note) {
        window.location.href = "#/" + note.path;
    } else {
        window.location.href = "#/";
    }
}
