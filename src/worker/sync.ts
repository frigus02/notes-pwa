import {
    getBlob,
    getRepoHead,
    getTreeRecursive,
    type Config,
    type Blob,
    type CreateCommitRequest,
    createCommit,
} from "../shared/github.js";
import storage, { type Note } from "../shared/storage.js";
import { reconcile } from "reconcile-text";

async function doSyncAll() {
    const settings = await storage.loadSettings();
    if (
        !settings.gitHubPat ||
        !settings.gitHubRepoOwner ||
        !settings.gitHubRepoName
    ) {
        throw new Error("Please configure sync in settings.");
    }

    const config: Config = {
        pat: settings.gitHubPat,
        repoOwner: settings.gitHubRepoOwner,
        repoName: settings.gitHubRepoName,
    };

    let head = await getRepoHead(config);
    console.log("HEAD", head, "local head", settings.gitHubHead);

    if (
        settings.gitHubHead?.id === head.id &&
        settings.gitHubHead?.oid === head.oid
    ) {
        console.log("Up to date");
        return;
    }

    const blobs = await getTreeRecursive(config, head);
    console.log("blobs", blobs);

    const notes = await storage.getNotes(true);

    interface CreateLocalAction {
        type: "create-local";
        blob: Blob;
        body: string;
    }
    interface UpdateLocalAction {
        type: "update-local";
        note: Note;
        blob: Blob;
        body: string;
    }
    interface DeleteLocalAction {
        type: "delete-local";
        note: Note;
    }
    interface CreateRemoteAction {
        type: "create-remote";
        note: Note;
    }
    interface UpdateRemoteAction {
        type: "update-remote";
        note: Note;
    }
    interface DeleteRemoteAction {
        type: "delete-remote";
        note: Note;
    }
    interface MergeAction {
        type: "merge";
        note: Note;
        blob: Blob;
        body: string;
    }
    type Action =
        | CreateLocalAction
        | UpdateLocalAction
        | DeleteLocalAction
        | CreateRemoteAction
        | UpdateRemoteAction
        | DeleteRemoteAction
        | MergeAction;
    const actions: Action[] = [];

    const seen = new Set<string>();
    for (const blob of blobs) {
        const note = notes.find((note) => note.path === blob.path);
        if (note) {
            seen.add(note.id);
            if (blob.sha !== note.lastSync?.sha) {
                const body = await getBlob(config, blob.sha);
                if (
                    note.deleted ||
                    note.body === body ||
                    note.body === note.lastSync?.body
                ) {
                    // remote change only --> update local
                    actions.push({ type: "update-local", note, blob, body });
                } else {
                    // remote and local change --> merge
                    actions.push({ type: "merge", note, blob, body });
                }
            } else if (note.deleted) {
                // local delete --> delete remote
                actions.push({ type: "delete-remote", note });
            } else if (note.body !== note.lastSync?.body) {
                // local change only --> update remote
                actions.push({ type: "update-remote", note });
            }
        } else {
            // create local note
            const body = await getBlob(config, blob.sha);
            actions.push({
                type: "create-local",
                blob,
                body,
            });
        }
    }

    for (const note of notes) {
        if (seen.has(note.id)) continue;
        if (note.deleted) continue;
        if (note.body !== note.lastSync?.body) {
            // create remote
            actions.push({ type: "create-remote", note });
        } else {
            // delete local
            actions.push({ type: "delete-local", note });
        }
    }

    console.log("actions", actions);

    const commit: CreateCommitRequest = {
        pat: config.pat,
        head,
        additions: [],
        deletions: [],
        message: "Sync",
    };
    for (const action of actions) {
        switch (action.type) {
            case "create-local":
                await storage.createNote({
                    path: action.blob.path,
                    body: action.body,
                    lastSync: {
                        sha: action.blob.sha,
                        body: action.body,
                    },
                });
                break;
            case "update-local":
                action.note.body = action.body;
                action.note.deleted = false;
                action.note.lastSync = {
                    sha: action.blob.sha,
                    body: action.body,
                };
                await storage.updateNote(action.note);
                break;
            case "delete-local":
                await storage.deleteNote(action.note.id, true);
                break;
            case "create-remote":
            case "update-remote":
                commit.additions.push({
                    path: action.note.path,
                    content: action.note.body,
                });
                break;
            case "delete-remote":
                commit.deletions.push({
                    path: action.note.path,
                });
                break;
            case "merge":
                const result = reconcile(
                    /*original*/ action.note.lastSync?.body ?? "",
                    /*left*/ action.note.body,
                    /*right*/ action.body,
                );
                // update local
                action.note.body = result.text;
                await storage.updateNote(action.note);
                // update remote
                commit.additions.push({
                    path: action.note.path,
                    content: result.text,
                });
                break;
        }
    }
    console.log("commit", commit);
    if (commit.additions.length > 0 || commit.deletions.length > 0) {
        head = await createCommit(commit);
        const newBlobs = await getTreeRecursive(config, head);
        for (const action of actions) {
            switch (action.type) {
                case "create-remote":
                case "update-remote":
                case "merge":
                    action.note.lastSync = {
                        sha: newBlobs.find(
                            (blob) => blob.path === action.note.path,
                        )!.sha,
                        body: action.note.body,
                    };
                    await storage.updateNote(action.note);
                    break;
                case "delete-remote":
                    await storage.deleteNote(action.note.id, true);
                    break;
            }
        }
    }

    await storage.saveSettings({ gitHubHead: head });
}

async function doSyncOne(note: Note) {
    const settings = await storage.loadSettings();
    if (
        !settings.gitHubPat ||
        !settings.gitHubRepoOwner ||
        !settings.gitHubRepoName
    ) {
        throw new Error("Please configure sync in settings.");
    }
    if (!settings.gitHubHead) {
        throw new Error("Must do a full sync before syncing one.");
    }

    const config: Config = {
        pat: settings.gitHubPat,
        repoOwner: settings.gitHubRepoOwner,
        repoName: settings.gitHubRepoName,
    };

    const commit: CreateCommitRequest = {
        pat: settings.gitHubPat,
        head: settings.gitHubHead,
        additions: [],
        deletions: [],
        message: `Sync ${note.path}`,
    };
    if (note.deleted) {
        commit.deletions.push({ path: note.path });
    } else {
        commit.additions.push({ path: note.path, content: note.body });
    }

    const newHead = await createCommit(commit);
    if (note.deleted) {
        await storage.deleteNote(note.id, true);
    } else {
        const newBlobs = await getTreeRecursive(config, newHead);
        note.lastSync = {
            sha: newBlobs.find((blob) => blob.path === note.path)!.sha,
            body: note.body,
        };
        await storage.updateNote(note);
    }

    await storage.saveSettings({ gitHubHead: newHead });
}

let isSyncing = false;

export async function syncAll() {
    if (isSyncing) {
        throw new Error("Sync already in progress");
    }

    isSyncing = true;
    try {
        await doSyncAll();
    } finally {
        isSyncing = false;
    }
}

export async function syncOne(note: Note) {
    if (isSyncing) {
        throw new Error("Sync already in progress");
    }

    isSyncing = true;
    try {
        await doSyncOne(note);
    } finally {
        isSyncing = false;
    }
}
