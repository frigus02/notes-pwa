import type { Note } from "./storage";

export const MS_SECOND = 1000;
export const MS_MINUTE = MS_SECOND * 60;
export const MS_HOUR = MS_MINUTE * 60;
export const MS_DAY = MS_HOUR * 24;

export function splitNote(note: Note): [string, string] {
    if (note.body.startsWith("# ")) {
        const title = note.body.substring(2, note.body.indexOf("\n")).trim();
        const body = note.body.substring(note.body.indexOf("\n") + 1).trim();
        return [title, body];
    }

    return ["<no title>", note.body];
}

export function timeAgo(date: number) {
    const diff = Date.now() - date;
    return diff < MS_MINUTE
        ? "just now"
        : diff < MS_HOUR
          ? `${Math.floor(diff / MS_MINUTE)} mins ago`
          : diff < MS_DAY
            ? `${Math.floor(diff / MS_HOUR)} hours ago`
            : `${Math.floor(diff / MS_DAY)} days ago`;
}
