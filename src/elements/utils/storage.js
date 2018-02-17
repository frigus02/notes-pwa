import { MS_DAY } from './format.js';

const NOTES = [
    { title: 'Hello', body: 'Looks like this is your first note.' }
];

class Storage extends EventTarget {
    static newId() {
        return (function b(a) { return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b) })();
    }

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
            const request = window.indexedDB.open('notes', 1);
            this._dbPromise = Storage.toPromise(request);

            request.onupgradeneeded = event => {
                const db = event.target.result;
                const objectStore = db.createObjectStore('notes', { keyPath: 'id' });
                objectStore.createIndex('modified', 'modified');
                objectStore.transaction.oncomplete = () => {
                    const notesObjectStore = db.transaction('notes', 'readwrite').objectStore('notes');
                    NOTES.forEach(note => {
                        note.id = Storage.newId();
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
            id: Storage.newId(),
            title: 'New note',
            body: '',
            modified: new Date()
        };
        return this._transaction(['notes'], 'readwrite', objectStores => {
            objectStores[0].add(note);
            return note;
        });
    }

    getNotes() {
        return this._transaction(['notes'], 'readonly', objectStores => {
            const modifiedIndex = objectStores[0].index('modified');
            return Storage.toPromise(modifiedIndex.getAll()).then(notes => notes.reverse());
        });
    }

    getNote(id) {
        return this._transaction(['notes'], 'readonly', objectStores => {
            return Storage.toPromise(objectStores[0].get(id));
        });
    }

    updateNote(note) {
        note.modified = new Date();
        return this._transaction(['notes'], 'readwrite', objectStores => {
            objectStores[0].put(note);
        });
    }
}

const instance = new Storage();

export default instance;
