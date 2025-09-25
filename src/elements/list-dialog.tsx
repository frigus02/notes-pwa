import { notes } from "./utils/notes.js";
import { timeAgo } from "../shared/format.js";

export function ListDialogContent() {
    return (
        <div class="notes-list">
            <header>
                <h1>Notes</h1>
                <form method="dialog">
                    <input type="submit" value="Close" />
                </form>
            </header>
            <ul>
                {notes.value.map((note) => (
                    <li class="note-item" key={note.path}>
                        <a href={`#/${note.path}`}>
                            <div>
                                <h2>{note.title}</h2>
                                <span class="path">{note.path}</span>
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
