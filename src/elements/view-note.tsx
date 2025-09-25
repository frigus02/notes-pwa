import storage from "../shared/storage.js";
import { splitNote } from "../shared/format.js";
import { sync } from "./utils/sync.js";
import { Toolbar } from "./toolbar.js";
import { NoteMetadata } from "./note-metadata.js";
import { NoteMarkdown } from "./note-markdown.js";
import { type UiNote } from "./utils/notes.js";
import { DefaultActions } from "./default-actions.js";
import { open } from "./utils/path.js";

export interface Props {
    note: UiNote;
    onEdit: () => void;
}

export function ViewNote({ note, onEdit }: Props) {
    const deleteNote = async () => {
        if (confirm("Delete note?")) {
            await storage.deleteNote(note.path);
            sync.one(await storage.getNote(note.path), undefined);
            open(undefined);
        }
    };

    const [_title, body] = splitNote(note.body);

    return (
        <div class="note-details">
            <Toolbar title={note.title} subTitle={note.path}>
                <DefaultActions />
                <button onClick={onEdit}>Edit</button>
                <button onClick={deleteNote}>Delete</button>
            </Toolbar>
            <div class="content">
                <NoteMetadata note={note}></NoteMetadata>
                <NoteMarkdown value={body}></NoteMarkdown>
            </div>
        </div>
    );
}
