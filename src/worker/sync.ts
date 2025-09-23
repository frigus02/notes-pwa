import storage, { type Note } from "../shared/storage.js";
import { reconcile } from "reconcile-text";

// Note available in TypeScript types, yet: https://github.com/microsoft/TypeScript/issues/61695
declare global {
    interface Uint8ArrayConstructor {
        /**
         * Creates a new `Uint8Array` from a base64-encoded string.
         * @param string The base64-encoded string.
         * @param options If provided, specifies the alphabet and handling of the last chunk.
         * @returns A new `Uint8Array` instance.
         * @throws {SyntaxError} If the input string contains characters outside the specified alphabet, or if the last
         * chunk is inconsistent with the `lastChunkHandling` option.
         */
        fromBase64(
            string: string,
            options?: {
                alphabet?: "base64" | "base64url";
                lastChunkHandling?: "loose" | "strict" | "stop-before-partial";
            },
        ): Uint8Array<ArrayBuffer>;
    }

    interface Uint8Array<TArrayBuffer extends ArrayBufferLike> {
        /**
         * Converts the `Uint8Array` to a base64-encoded string.
         * @param options If provided, sets the alphabet and padding behavior used.
         * @returns A base64-encoded string.
         */
        toBase64(options?: {
            alphabet?: "base64" | "base64url";
            omitPadding?: boolean;
        }): string;
    }
}

export interface Options {
    pat: string;
    repoOwner: string;
    repoName: string;
    dryRun: boolean;
}

interface GraphQLRequest {
    pat: string;
    query: string;
    variables: Record<string, unknown>;
}

async function ghGraphQL({ pat, query, variables }: GraphQLRequest) {
    const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            authorization: `Bearer ${pat}`,
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });
    if (!res.ok) {
        throw new Error("fetch failed: " + res.statusText);
    }

    const result = await res.json();
    return result.data;
}

interface RestRequest {
    pat: string;
    pathAndQuery: string;
    apiVersion: string;
}

async function ghRest({ pat, pathAndQuery, apiVersion }: RestRequest) {
    const res = await fetch(`https://api.github.com` + pathAndQuery, {
        headers: {
            accept: "application/vnd.github+json",
            authorization: `Bearer ${pat}`,
            "X-GitHub-Api-Version": apiVersion,
        },
    });
    if (!res.ok) {
        throw new Error("fetch failed: " + res.statusText);
    }

    const result = await res.json();
    return result;
}

interface RepoHead {
    id: string;
    oid: string;
}

async function getRepoHead(options: Options): Promise<RepoHead> {
    const result = await ghGraphQL({
        pat: options.pat,
        query: `query($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            defaultBranchRef {
              id
              target {
                oid
              }
            }
          }
        }`,
        variables: {
            owner: options.repoOwner,
            name: options.repoName,
        },
    });
    return {
        id: result.repository.defaultBranchRef.id,
        oid: result.repository.defaultBranchRef.target.oid,
    };
}

interface CreateCommitRequest {
    pat: string;
    head: RepoHead;
    message: string;
    additions: Array<{ path: string; content: string }>;
    deletions: Array<{ path: string }>;
}

async function createCommit({
    pat,
    head,
    message,
    additions,
    deletions,
}: CreateCommitRequest): Promise<RepoHead> {
    const encoder = new TextEncoder();
    const result = await ghGraphQL({
        pat,
        query: `mutation($branchId: ID, $headOid: GitObjectID!, $fileChanges: FileChanges! $message: String!) {
          createCommitOnBranch(input: {
            branch: { id: $branchId },
            expectedHeadOid: $headOid,
            fileChanges: $fileChanges,
            message: {
              headline: $message
            }
          }) {
            commit {
              oid
            }
          }
        }`,
        variables: {
            branchId: head.id,
            headOid: head.oid,
            fileChanges: {
                additions: additions.map((addition) => ({
                    path: addition.path,
                    contents: encoder.encode(addition.content).toBase64(),
                })),
                deletions,
            },
            message,
        },
    });
    return {
        id: head.id,
        oid: result.createCommitOnBranch.commit.oid,
    };
}

interface TreeObject {
    path: string;
    mode: string;
    type: string;
    sha: string;
    size?: number;
    url?: string;
}

interface GetTreesResponse {
    sha: string;
    url?: string;
    tree: TreeObject[];
    truncated: boolean;
}

interface Blob {
    path: string;
    sha: string;
}

async function getTreeRecursive(
    options: Options,
    head: RepoHead,
): Promise<Blob[]> {
    const result: GetTreesResponse = await ghRest({
        pat: options.pat,
        pathAndQuery: `/repos/${options.repoOwner}/${options.repoName}/git/trees/${head.oid}?recursive=1`,
        apiVersion: "2022-11-28",
    });
    if (result.truncated) {
        throw new Error("trees truncated; not supported");
    }

    return result.tree
        .filter((item) => item.type === "blob" && item.path.endsWith(".md"))
        .map((item) => ({ path: item.path, sha: item.sha }) satisfies Blob);
}

interface GetBlobResponse {
    content: string;
    encoding: string;
    url: string;
    sha: string;
    size: number | null;
    node_id: string;
    highlighted_content?: string;
}

async function getBlob(options: Options, blobSha: string): Promise<string> {
    const result: GetBlobResponse = await ghRest({
        pat: options.pat,
        pathAndQuery: `/repos/${options.repoOwner}/${options.repoName}/git/blobs/${blobSha}`,
        apiVersion: "2022-11-28",
    });
    if (result.encoding !== "base64") {
        throw new Error("unsupported encoding: " + result.encoding);
    }

    const decoder = new TextDecoder();
    return decoder.decode(Uint8Array.fromBase64(result.content));
}

export async function sync(options: Options) {
    const notes = await storage.getNotes(true);

    let head = await getRepoHead(options);
    console.log("HEAD", head);
    const blobs = await getTreeRecursive(options, head);
    console.log("tree", blobs);

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
                const body = await getBlob(options, blob.sha);
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
            } else if (note.body !== note.lastSync?.sha) {
                // local change only --> update remote
                actions.push({ type: "update-remote", note });
            }
        } else {
            // create local note
            const body = await getBlob(options, blob.sha);
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

    if (options.dryRun) {
        console.log("dry run");
        return;
    }

    const commit: CreateCommitRequest = {
        pat: options.pat,
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
        const newBlobs = await getTreeRecursive(options, head);
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
