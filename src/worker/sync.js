import storage from "../shared/storage.js";

async function listDbxFiles(accessToken) {
    // https://dropbox.github.io/dropbox-api-v2-explorer/#files_list_folder
    // https://dropbox.github.io/dropbox-api-v2-explorer/#files_list_folder/continue

    let response = await fetch(
        "https://api.dropboxapi.com/2/files/list_folder",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                path: "",
                recursive: true,
            }),
        },
    );
    let result = await response.json();

    const files = [...result.entries];
    while (result.has_more) {
        let response = await fetch(
            "https://api.dropboxapi.com/2/files/list_folder/continue",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cursor: result.cursor,
                }),
            },
        );
        let result = await response.json();

        files.push(...result.entries);
    }

    return files;
}

async function downloadDbxFile(accessToken, dbxFile, note) {
    // https://dropbox.github.io/dropbox-api-v2-explorer/#files_download

    // Download file
    const response = await fetch(
        "https://content.dropboxapi.com/2/files/download",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Dropbox-API-Arg": JSON.stringify({
                    path: dbxFile.path_lower,
                }),
            },
        },
    );
    const metadata = JSON.parse(response.headers.get("dropbox-api-result"));
    const contents = await response.text();

    // Update note
    note.title = dbxFile.path_display.split("/").pop().split(".")[0];
    note.body = contents;
    note.sync = {
        id: metadata.id,
        rev: metadata.rev,
    };
    await storage.updateNote(note, true);
}

async function uploadDbxFile(accessToken, dbxFile, note) {
    // https://dropbox.github.io/dropbox-api-v2-explorer/#files_upload

    // Upload file
    const response = await fetch(
        "https://content.dropboxapi.com/2/files/upload",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/octet-stream",
                "Dropbox-API-Arg": JSON.stringify({
                    path: dbxFile ? dbxFile.path_lower : `/${note.title}.md`,
                    mode: note.sync
                        ? { ".tag": "update", update: note.sync.rev }
                        : { ".tag": "add" },
                }),
            },
            body: note.body,
        },
    );
    const result = await response.json();

    // Update note
    note.sync = {
        id: result.id,
        rev: result.rev,
    };
    await storage.updateNote(note, true);
}

async function deleteDbxFile(accessToken, dbxFile) {
    // https://dropbox.github.io/dropbox-api-v2-explorer/#files_delete_v2

    await fetch("https://api.dropboxapi.com/2/files/delete_v2", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            path: dbxFile.path_lower,
        }),
    });
}

async function sync(accessToken) {
    const notes = await storage.getNotes(true);
    const dbxFiles = await listDbxFiles(accessToken);

    const items = dbxFiles.map((dbxFile) => ({
        dbxFile,
        note: notes.find((note) => note.sync && note.sync.id === dbxFile.id),
    }));
    items.push(
        ...notes
            .filter((note) => !items.some((item) => item.note === note))
            .map((note) => ({
                dbxFile:
                    note.sync &&
                    dbxFiles.find((dbxFile) => dbxFile.id === note.sync.id),
                note,
            })),
    );

    for (const item of items) {
        if (!item.note) {
            const note = await storage.createNote();
            await downloadDbxFile(accessToken, item.dbxFile, note);
        } else if (!item.dbxFile) {
            if (item.note.sync) {
                item.note._deleted = true;
            } else if (!item.note._deleted) {
                await uploadDbxFile(accessToken, null, item.note);
            }
        } else if (item.note._deleted) {
            await deleteDbxFile(accessToken, item.dbxFile);
        } else if (item.note.sync.lastSync < item.note.modified) {
            await uploadDbxFile(accessToken, item.dbxFile, item.note);
        } else if (item.note.sync.rev !== item.dbxFile.rev) {
            await downloadDbxFile(accessToken, item.dbxFile, item.note);
        }
    }

    // Remove deleted notes
    const deletedNotes = notes.filter((note) => note._deleted);
    for (const note of deletedNotes) {
        await storage.deleteNote(note.id, true);
    }
}

export default sync;
