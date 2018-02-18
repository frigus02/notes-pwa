import { MS_DAY } from './format.js';
import { newId } from './id.js';

const NOTES = [
    { title: 'Hello', body: 'Looks like this is your first note.' }
];

class Storage extends EventTarget {
    static toPromise(request) {
        return new Promise((resolve, reject) => {
            request.onerror = event => {
                reject(event.target.error);
            };
            request.onsuccess = event => {
                resolve(event.target.result);
            };
        });
    }

    _openDatabase() {
        if (!this._dbPromise) {
            const request = indexedDB.open('notes', 1);
            this._dbPromise = Storage.toPromise(request);

            request.onupgradeneeded = event => {
                const db = event.target.result;
                const objectStore = db.createObjectStore('notes', { keyPath: 'id' });
                objectStore.createIndex('modified', 'modified');
                objectStore.transaction.oncomplete = () => {
                    const notesObjectStore = db.transaction('notes', 'readwrite').objectStore('notes');
                    NOTES.forEach(note => {
                        note.id = newId();
                        note.modified = new Date();
                        notesObjectStore.add(note);
                    });
                };
            };
        }

        return this._dbPromise;
    }

    async _transaction(objectStoreNames, mode, callback) {
        const db = await this._openDatabase();
        const transaction = db.transaction(objectStoreNames, mode);
        const objectStores = objectStoreNames.map(name => transaction.objectStore(name));
        const result = callback(objectStores);

        return new Promise((resolve, reject) => {
            transaction.onerror = event => {
                reject(event.target.error);
            };
            transaction.oncomplete = event => {
                resolve(result);
            };
        });
    }

    createNote() {
        const note = {
            id: newId(),
            title: 'New note',
            body: '',
            modified: new Date()
        };
        return this._transaction(['notes'], 'readwrite', objectStores => {
            objectStores[0].add(note);
            return note;
        });
    }

    getNotes(includeDeleted) {
        return this._transaction(['notes'], 'readonly', async objectStores => {
            const modifiedIndex = objectStores[0].index('modified');
            let notes = await Storage.toPromise(modifiedIndex.getAll());
            if (!includeDeleted) {
                notes = notes.filter(note => !note._deleted);
            }

            return notes.reverse();
        });
    }

    getNote(id) {
        return this._transaction(['notes'], 'readonly', objectStores => {
            return Storage.toPromise(objectStores[0].get(id));
        });
    }

    updateNote(note, setSyncDate) {
        note.modified = new Date();
        if (setSyncDate) {
            note.sync.lastSync = note.modified;
        }

        return this._transaction(['notes'], 'readwrite', objectStores => {
            objectStores[0].put(note);
        });
    }

    deleteNote(id, force) {
        return this._transaction(['notes'], 'readwrite', async objectStores => {
            if (force) {
                objectStores[0].delete(id);
            } else {
                objectStores[0].get(id).onsuccess = e => {
                    const note = e.target.result;
                    note._deleted = true;
                    objectStores[0].put(note);
                };
            }
        });
    }
}

const instance = new Storage();

export default instance;
