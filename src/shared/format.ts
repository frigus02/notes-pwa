import type { Note } from "./storage";

export const MS_SECOND = 1000;
export const MS_MINUTE = MS_SECOND * 60;
export const MS_HOUR = MS_MINUTE * 60;
export const MS_DAY = MS_HOUR * 24;

export function splitNote(body: string): [string, string] {
    if (body.startsWith("# ")) {
        const firstLineEnd = body.indexOf("\n");
        if (firstLineEnd === -1) {
            return [body.substring(1).trim(), ""];
        }
        const title = body.substring(2, firstLineEnd).trim();
        const newBody = body.substring(firstLineEnd + 1).trim();
        return [title, newBody];
    }

    return ["", body];
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

export function shortDate(date: Date) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}

export function syncState(note: Note) {
    if (note.body === note.lastSync?.body) {
        return "synced";
    }
    return "modified";
}
