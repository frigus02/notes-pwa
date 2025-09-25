import { timeAgo } from "../shared/format.js";
import type { UiNote } from "./utils/notes.js";

interface Props {
    note: UiNote;
}

export function NoteMetadata({ note }: Props) {
    return (
        <dl class="note-metadata">
            <dt>Modified:</dt>
            <dd>{timeAgo(note.modified.getTime())}</dd>
            <dt>Sync:</dt>
            <dd>{note.syncState}</dd>
        </dl>
    );
}
