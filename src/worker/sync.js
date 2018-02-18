import { Dropbox } from 'dropbox/dist/Dropbox-sdk.js';
import storage from '../shared/storage.js';

async function listDbxFiles(dbx) {
    let result = await dbx.filesListFolder({
        path: '',
        recursive: true
    });
    const files = [...result.entries];
    while (result.has_more) {
        let result = await dbx.filesListFolderContinue({
            cursor: result.cursor
        });
        files.push(...result.entries);
    }

    return files;
}

async function downloadDbxFile(dbx, path) {
    const response = await fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${dbx.getAccessToken()}`,
            'Dropbox-API-Arg': JSON.stringify({
                path
            })
        }
    });
    const metadata = JSON.parse(response.headers.get('dropbox-api-result'));
    metadata.content = await response.text();
    return metadata;
}

async function sync(clientId, accessToken) {
    const dbx = new Dropbox({
        accessToken: loadAccessToken(),
        clientId: 'mr76lz3bjoqdof3'
    });

    const dbxFiles = await listDbxFiles();
    const localNotes = await storage.getNotes(true);
    const deletedNotes = localNotes.filter(note =>
        note._deleted ||
        (note.sync && !dbxFiles.some(file => file.id === note.sync.id)));

    // Upload new notes to Dropbox
    const newNotes = localNotes.filter(note => !note._deleted && !note.sync);
    for (const note of newNotes) {
        const result = await dbx.filesUpload({
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
        const result = await downloadDbxFile(file.path_lower);
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
        const result = await dbx.filesUpload({
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
        const result = await downloadDbxFile(file.path_lower);
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
        await dbx.filesDeleteV2({
            path: file.path_lower
        });
    }

    // Remove deleted notes
    for (const note of deletedNotes) {
        await storage.deleteNote(note.id, true);
    }
}

export default sync;
