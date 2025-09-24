import { splitNote, syncState, timeAgo } from "../shared/format.js";
import { type Note } from "../shared/storage.js";

interface Props {
    notes: Note[];
}

export function NotesList({ notes }: Props) {
    return (
        <ul class="notes-list">
            {notes.map((note) => (
                <li class="note-item" key={note.id}>
                    <a href={`/note/${note.id}`}>
                        <div>
                            <h2>{splitNote(note)[0]}</h2>
                            {note.path !== splitNote(note)[0] ? (
                                <span class="path">{note.path}</span>
                            ) : null}
                        </div>
                        <div class="metadata">
                            <div>{timeAgo(note.modified.getTime())}</div>
                            <div>{syncState(note)}</div>
                        </div>
                    </a>
                </li>
            ))}
        </ul>
    );
}
