import storage from "../shared/storage.js";
import { splitNote } from "../shared/format.js";
import { sync } from "./utils/sync.js";
import { Toolbar } from "./toolbar.js";
import { NoteMetadata } from "./note-metadata.js";
import { NoteMarkdown } from "./note-markdown.js";
import { type UiNote } from "./utils/notes.js";
import { DefaultActions } from "./default-actions.js";
import { open } from "./utils/path.js";
import { IconButton } from "./icon-button.js";
import { useRef, useState } from "preact/hooks";

export interface Props {
    note: UiNote;
    onEdit: () => void;
}

export function ViewNote({ note, onEdit }: Props) {
    const [isReadMode, setReadMode] = useState(false);
    const wakeLock = useRef<WakeLockSentinel>(null);
    const enterReadMode = async () => {
        try {
            // Ideally we'd release on unmount, but ... I'm too lazy right now.
            wakeLock.current = await navigator.wakeLock.request("screen");
            wakeLock.current.addEventListener("release", () => {
                wakeLock.current = null;
                setReadMode(false);
            });
            setReadMode(true);
        } catch (e) {
            alert(
                `Failed to receive wake lock: ${e instanceof Error ? e.message : e}`,
            );
        }
    };
    const exitReadMode = async () => {
        await wakeLock.current?.release();
    };

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
                {isReadMode ? (
                    <IconButton icon="close" onClick={exitReadMode} />
                ) : (
                    <>
                        <IconButton icon="edit" onClick={onEdit} />
                        <DefaultActions
                            moreActions={{
                                "Read mode": enterReadMode,
                                Delete: deleteNote,
                            }}
                        />
                    </>
                )}
            </Toolbar>
            <div class="content">
                <NoteMetadata note={note}></NoteMetadata>
                <NoteMarkdown value={body}></NoteMarkdown>
            </div>
        </div>
    );
}
