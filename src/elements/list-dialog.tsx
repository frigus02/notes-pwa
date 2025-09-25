import { notes } from "./utils/notes.js";
import { timeAgo } from "../shared/format.js";

export function ListDialogContent() {
    return (
        <div class="notes-list">
            <h1>Notes</h1>
            <ul class="notes-list">
                {notes.value.map((note) => (
                    <li class="note-item" key={note.path}>
                        <a href={`/view/${note.path}`}>
                            <div>
                                <h2>{note.title}</h2>
                                {note.path !== note.title ? (
                                    <span class="path">{note.path}</span>
                                ) : null}
                            </div>
                            <div class="metadata">
                                <div>{timeAgo(note.modified.getTime())}</div>
                                <div>{note.syncState}</div>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
