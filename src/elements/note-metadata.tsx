import { syncState, timeAgo } from "../shared/format.js";
import type { Note } from "../shared/storage.js";

interface Props {
    note: Note;
}

export function NoteMetadata({ note }: Props) {
    return (
        <dl class="note-metadata">
            <dt>Modified:</dt>
            <dd>{timeAgo(note.modified.getTime())}</dd>
            <dt>Sync:</dt>
            <dd>{syncState(note)}</dd>
        </dl>
    );
}
