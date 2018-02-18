import { Dropbox } from 'dropbox/dist/Dropbox-sdk.js';
import storage from './storage.js';

function loadAccessToken() {
    return window.localStorage.getItem('dbx-access-token');
}

function saveAccessToken(accessToken) {
    window.localStorage.setItem('dbx-access-token', accessToken);
}

class Sync {
    constructor() {
        this._init();
    }

    _init() {
        this._dbx = new Dropbox({
            accessToken: loadAccessToken(),
            clientId: 'mr76lz3bjoqdof3'
        });
    }

    async _listDbxFiles() {
        let result = await this._dbx.filesListFolder({
            path: '',
            recursive: true
        });
        const files = [...result.entries];
        while (result.has_more) {
            let result = await this._dbx.filesListFolderContinue({
                cursor: result.cursor
            });
            files.push(...result.entries);
        }

        return files;
    }

    async _downloadDbxFile(path) {
        const response = await fetch('https://content.dropboxapi.com/2/files/download', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this._dbx.getAccessToken()}`,
                'Dropbox-API-Arg': JSON.stringify({
                    path
                })
            }
        });
        const metadata = JSON.parse(response.headers.get('dropbox-api-result'));
        metadata.content = await response.text();
        return metadata;
    }

    isAuthenticated() {
        return !!this._dbx.getAccessToken();
    }

    async authenticate() {
        const params = new URLSearchParams(window.location.hash.substr(1));
        if (params.has('access_token')) {
            saveAccessToken(params.get('access_token'));
            window.history.replaceState(null, '', window.location.pathname);
            this._init();
        } else {
            const url = this._dbx.getAuthenticationUrl('http://localhost:8080');
            window.location = url;
            return new Promise(() => { });
        }
    }

    async sync() {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated.');
        }

        const dbxFiles = await this._listDbxFiles();
        const localNotes = await storage.getNotes(true);
        const deletedNotes = localNotes.filter(note =>
            note._deleted ||
            (note.sync && !dbxFiles.some(file => file.id === note.sync.id)));

        // Upload new notes to Dropbox
        const newNotes = localNotes.filter(note => !note._deleted && !note.sync);
        for (const note of newNotes) {
            const result = await this._dbx.filesUpload({
                contents: note.body,
                path: `/${note.title}.md`,
                mode: { '.tag': 'add' }
            });
            note.sync = {
                id: result.id,
                rev: result.rev
            };
            await storage.updateNote(note, true);
        }

        // Download new notes from Dropbox
        const newFiles = dbxFiles
            .filter(file => !localNotes.some(note => note.sync && note.sync.id === file.id));
        for (const file of newFiles) {
            const result = await this._downloadDbxFile(file.path_lower);
            const note = await storage.createNote();
            note.title = file.path_display.split('/').pop().split('.')[0];
            note.body = result.content;
            note.sync = {
                id: result.id,
                rev: result.rev
            };
            await storage.updateNote(note, true);
        }

        // Upload updated notes to Dropbox
        const updatedNotes = localNotes.filter(note =>
            !note._deleted &&
            note.sync &&
            note.sync.lastSync < note.modified &&
            dbxFiles.some(file => file.id === note.sync.id));
        for (const note of updatedNotes) {
            const file = dbxFiles.find(file => file.id === note.sync.id);
            const result = await this._dbx.filesUpload({
                contents: note.body,
                path: file.path_lower,
                mode: { '.tag': 'update', update: note.sync.rev }
            });
            note.sync.rev = result.rev;
            await storage.updateNote(note, true);
        }

        // Download updated notes from Dropbox
        const updatedFiles = dbxFiles.filter(file => localNotes.some(note =>
            note.sync &&
            note.sync.id === file.id &&
            note.sync.rev !== file.rev));
        for (const file of updatedFiles) {
            const note = localNotes.find(note => note.sync && note.sync.id === file.id);
            const result = await this._downloadDbxFile(file.path_lower);
            note.title = file.path_display.split('/').pop().split('.')[0];
            note.body = result.content;
            note.sync.rev = result.rev;
            await storage.updateNote(note, true);
        }

        // Remove deleted notes from Dropbox
        const deletedNoteFiles = deletedNotes
            .filter(note => note.sync && dbxFiles.some(file => file.id === note.sync.id))
            .map(note => dbxFiles.find(file => file.id === note.sync.id));
        for (const file of deletedNoteFiles) {
            await this._dbx.filesDeleteV2({
                path: file.path_lower
            });
        }

        // Remove deleted notes
        for (const note of deletedNotes) {
            await storage.deleteNote(note.id, true);
        }
    }
}

const instance = new Sync();

export default instance;
