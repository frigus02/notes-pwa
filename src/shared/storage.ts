import { computed, signal } from "@preact/signals";

export interface Note {
    path: string;
    body: string;
    modified: Date;
    deleted: boolean;
    lastSync: { body: string; sha: string } | undefined;
}

export interface NewNote {
    path: string;
    body: string;
    lastSync?: { body: string; sha: string } | undefined;
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

class Storage {
    private _dbPromise?: Promise<IDBDatabase>;

    private readonly _modified = signal<Date>();
    readonly modified = computed(() => this._modified.value);

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

    private markModified() {
        this._modified.value = new Date();
    }

    _openDatabase() {
        if (!this._dbPromise) {
            const request = indexedDB.open("notes", 1);
            this._dbPromise = Storage.toPromise(request);

            request.onupgradeneeded = () => {
                const db = request.result;

                const objectStore = db.createObjectStore("notes", {
                    keyPath: "path",
                });
                objectStore.createIndex("modified", "modified");
                objectStore.transaction.oncomplete = () => {
                    const notesObjectStore = db
                        .transaction("notes", "readwrite")
                        .objectStore("notes");
                    NOTES.forEach((note) => {
                        const newNote: Note = {
                            ...note,
                            modified: new Date(),
                            deleted: false,
                            lastSync: undefined,
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
            transaction.onerror = (e) => {
                reject((e.target as IDBRequest).error);
            };
            transaction.oncomplete = () => {
                resolve(result);
            };
        });
    }

    async createNote(params: NewNote): Promise<Note> {
        const note: Note = {
            deleted: false,
            lastSync: undefined,
            ...params,
            modified: new Date(),
        };
        await this._transaction(["notes"], "readwrite", (objectStores) => {
            objectStores[0].add(note);
        });
        this.markModified();
        return note;
    }

    getNotes(includeDeleted?: boolean): Promise<Note[]> {
        return this._transaction(
            ["notes"],
            "readonly",
            async (objectStores) => {
                const modifiedIndex = objectStores[0].index("modified");
                let notes: Note[] = await Storage.toPromise(
                    modifiedIndex.getAll(),
                );
                if (!includeDeleted) {
                    notes = notes.filter((note) => !note.deleted);
                }

                return notes.reverse();
            },
        );
    }

    getNote(path: string): Promise<Note> {
        return this._transaction(["notes"], "readonly", (objectStores) => {
            return Storage.toPromise(objectStores[0].get(path));
        });
    }

    async updateNote(note: Note): Promise<void> {
        note.modified = new Date();
        await this._transaction(["notes"], "readwrite", (objectStores) => {
            objectStores[0].put(note);
        });
        this.markModified();
    }

    async deleteNote(path: string, force?: boolean): Promise<void> {
        await this._transaction(
            ["notes"],
            "readwrite",
            async (objectStores) => {
                if (force) {
                    objectStores[0].delete(path);
                } else {
                    objectStores[0].get(path).onsuccess = (e) => {
                        const note: Note = (e.target as IDBRequest).result;
                        note.deleted = true;
                        objectStores[0].put(note);
                    };
                }
            },
        );
        this.markModified();
    }

    async saveSettings(settings: Partial<Settings>): Promise<void> {
        await this._transaction(["settings"], "readwrite", (objectStores) => {
            for (const [name, value] of Object.entries(settings)) {
                objectStores[0].put({
                    name,
                    value,
                });
            }
        });
        this.markModified();
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
