import { newId } from "./id.js";

export interface Note {
    id: string;
    path: string;
    body: string;
    modified: Date;
    deleted: boolean;
    lastSync: { body: string; sha: string } | undefined;
    pendingSync: { body: string; sha: string } | undefined;
}

const NOTES: Array<Pick<Note, "path" | "body">> = [
    {
        path: "hello.md",
        body: "# Hello\n\nLooks like this is your first note.",
    },
];

export interface Settings {
    gitHubPat: string;
    gitHubRepoOwner: string;
    gitHubRepoName: string;
    gitHubHead: { id: string; oid: string };
}

class Storage extends EventTarget {
    private _dbPromise?: Promise<IDBDatabase>;

    static toPromise<T>(request: IDBRequest<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            request.onerror = () => {
                reject(request.error);
            };
            request.onsuccess = () => {
                resolve(request.result);
            };
        });
    }

    _openDatabase() {
        if (!this._dbPromise) {
            const request = indexedDB.open("notes", 1);
            this._dbPromise = Storage.toPromise(request);

            request.onupgradeneeded = () => {
                const db = request.result;

                const objectStore = db.createObjectStore("notes", {
                    keyPath: "id",
                });
                objectStore.createIndex("modified", "modified");
                objectStore.createIndex("path", "path", { unique: true });
                objectStore.transaction.oncomplete = () => {
                    const notesObjectStore = db
                        .transaction("notes", "readwrite")
                        .objectStore("notes");
                    NOTES.forEach((note) => {
                        const newNote: Note = {
                            ...note,
                            id: newId(),
                            modified: new Date(),
                            deleted: false,
                            lastSync: undefined,
                            pendingSync: undefined,
                        };
                        notesObjectStore.add(newNote);
                    });
                };

                db.createObjectStore("settings", {
                    keyPath: "name",
                });
            };
        }

        return this._dbPromise;
    }

    async _transaction<T>(
        objectStoreNames: string[],
        mode: IDBTransactionMode,
        callback: (objectStores: IDBObjectStore[]) => T | PromiseLike<T>,
    ): Promise<T> {
        const db = await this._openDatabase();
        const transaction = db.transaction(objectStoreNames, mode);
        const objectStores = objectStoreNames.map((name) =>
            transaction.objectStore(name),
        );
        const result = callback(objectStores);

        return new Promise((resolve, reject) => {
            transaction.onerror = () => {
                reject(transaction.error);
            };
            transaction.oncomplete = () => {
                resolve(result);
            };
        });
    }

    createNote(): Promise<Note> {
        const note: Note = {
            id: newId(),
            path: "new.md",
            body: "# New note",
            modified: new Date(),
            deleted: false,
            lastSync: undefined,
            pendingSync: undefined,
        };
        return this._transaction(["notes"], "readwrite", (objectStores) => {
            objectStores[0].add(note);
            return note;
        });
    }

    getNotes(includeDeleted?: boolean): Promise<Note[]> {
        return this._transaction(
            ["notes"],
            "readonly",
            async (objectStores) => {
                const modifiedIndex = objectStores[0].index("modified");
                let notes = await Storage.toPromise(modifiedIndex.getAll());
                if (!includeDeleted) {
                    notes = notes.filter((note) => !note._deleted);
                }

                return notes.reverse();
            },
        );
    }

    getNote(id: string): Promise<Note> {
        return this._transaction(["notes"], "readonly", (objectStores) => {
            return Storage.toPromise(objectStores[0].get(id));
        });
    }

    updateNote(note: Note): Promise<void> {
        note.modified = new Date();
        return this._transaction(["notes"], "readwrite", (objectStores) => {
            objectStores[0].put(note);
        });
    }

    deleteNote(id: string, force?: boolean): Promise<void> {
        return this._transaction(
            ["notes"],
            "readwrite",
            async (objectStores) => {
                if (force) {
                    objectStores[0].delete(id);
                } else {
                    objectStores[0].get(id).onsuccess = (e) => {
                        const note: Note = (e.target as IDBRequest).result;
                        note.deleted = true;
                        objectStores[0].put(note);
                    };
                }
            },
        );
    }

    saveSettings(settings: Partial<Settings>): Promise<void> {
        return this._transaction(["settings"], "readwrite", (objectStores) => {
            for (const [name, value] of Object.entries(settings)) {
                objectStores[0].put({
                    name,
                    value,
                });
            }
        });
    }

    loadSettings(): Promise<Partial<Settings>> {
        return this._transaction(
            ["settings"],
            "readonly",
            async (objectStores) => {
                const items = await Storage.toPromise(objectStores[0].getAll());
                return Object.fromEntries(
                    items.map((item) => [item.name, item.value]),
                );
            },
        );
    }
}

const instance = new Storage();

export default instance;
