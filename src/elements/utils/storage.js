const NOTES = [
    { id: 1, title: 'Essen', summary: '- Spaghetti Napoli', modified: '2 days ago' },
    { id: 2, title: 'Wi-Fi', summary: 'My Net', modified: '20 days ago' },
    { id: 3, title: 'To-do', summary: 'Nothing', modified: '21 days ago' },
    { id: 4, title: 'Lifehacks', summary: '...', modified: '30 days ago' },
    { id: 5, title: 'Lifehacks', summary: '...', modified: '30 days ago' },
    { id: 6, title: 'Lifehacks', summary: '...', modified: '30 days ago' },
    { id: 7, title: 'Lifehacks', summary: '...', modified: '30 days ago' }
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

    static getAll(objectStore) {
        return Storage.toPromise(objectStore.getAll());
    }

    static get(objectStore, id) {
        return Storage.toPromise(objectStore.get(id));
    }

    _openDatabase() {
        if (!this._dbPromise) {
            const request = window.indexedDB.open('notes', 1);
            this._dbPromise = Storage.toPromise(request);

            request.onupgradeneeded = event => {
                const db = event.target.result;
                const objectStore = db.createObjectStore('notes', { keyPath: 'id' });
                objectStore.transaction.oncomplete = () => {
                    const notesObjectStore = db.transaction('notes', 'readwrite').objectStore('notes');
                    NOTES.forEach(note => notesObjectStore.add(note));
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

    getNotes() {
        return this._transaction(['notes'], 'readonly', objectStores => {
            return Storage.getAll(objectStores[0]);
        });
    }

    getNote(id) {
        return this._transaction(['notes'], 'readonly', objectStores => {
            return Storage.get(objectStores[0], id);
        });
    }
}

const instance = new Storage();

export default instance;
