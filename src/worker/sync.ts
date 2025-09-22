import storage, { type Note } from "../shared/storage.js";

export interface Options {
    pat: string;
    repoOwner: string;
    repoName: string;
}

async function ghGraphQL(
    options: Options,
    query: string,
    variables: Record<string, string>,
) {
    const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            authorization: `Bearer ${options.pat}`,
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

async function ghRest(
    options: Options,
    pathAndQuery: string,
    init: RequestInit,
) {
    const res = await fetch(`https://api.github.com` + pathAndQuery, {
        ...init,
        headers: {
            accept: "application/vnd.github+json",
            authorization: `Bearer ${options.pat}`,
            ...init.headers,
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
    const result = await ghGraphQL(
        options,
        `query($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            defaultBranchRef {
              id
              target {
                oid
              }
            }
          }
        }`,
        {
            owner: options.repoOwner,
            name: options.repoName,
        },
    );
    return {
        id: result.repository.defaultBranchRef.id,
        oid: result.repository.defaultBranchRef.target.oid,
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
    const result: GetTreesResponse = await ghRest(
        options,
        `/repos/${options.repoOwner}/${options.repoName}/git/trees/${head.oid}?recursive=1`,
        {
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
            },
        },
    );
    if (result.truncated) {
        throw new Error("trees truncated; not supported");
    }

    return result.tree
        .filter((item) => item.type === "blob" && item.path.endsWith(".md"))
        .map((item) => ({ path: item.path, sha: item.sha }) satisfies Blob);
}

export async function sync(options: Options) {
    const notes = await storage.getNotes(true);

    const head = await getRepoHead(options);
    console.log("HEAD", head);
    const blobs = await getTreeRecursive(options, head);
    console.log("tree", blobs);

    // loop through blobs
    // - if matching note based on path
    //   - update note.currentRemote --> if head differs, fetch blob content
    //   - if note.currentRemote == note.lastSyncRemote == note.{body,deleted} --> all done
    //   - if note.currentRemote != note.lastSyncRemote != note --> merge
    //   - if note.currentRemote != note.lastSyncRemote --> update note.body
    //   - if note.lastSyncRemote != note --> update remote
    // - else --> create local note
    //
    // loop through notes not yet visited
    // - if note has remote
    //   - if note != note.lastSyncRemote --> recreate remote note?
    //   - else --> delete local note
    // - else --> create remote note

    // Remove deleted notes
    const deletedNotes = notes.filter((note) => note.deleted);
    for (const note of deletedNotes) {
        await storage.deleteNote(note.id, true);
    }
}
