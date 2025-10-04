import { notes } from "./utils/notes.js";
import { useRef } from "preact/hooks";

export function ListDialogContent() {
    const form = useRef<HTMLFormElement>(null);
    const onClick = () => {
        form.current?.submit();
    };
    return (
        <div class="notes-list">
            <header>
                <h1>Notes</h1>
                <form method="dialog" ref={form}>
                    <input type="submit" value="Close" />
                </form>
            </header>
            <ul>
                {notes.value.map((note) => (
                    <li class="note-item" key={note.path}>
                        <a href={`#/${note.path}`} onClick={onClick}>
                            <div>{note.title}</div>
                            <div class="path">{note.path}</div>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
