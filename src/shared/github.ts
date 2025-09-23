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

export interface Config {
    pat: string;
    repoOwner: string;
    repoName: string;
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

export interface RepoHead {
    id: string;
    oid: string;
}

export async function getRepoHead(config: Config): Promise<RepoHead> {
    const result = await ghGraphQL({
        pat: config.pat,
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
            owner: config.repoOwner,
            name: config.repoName,
        },
    });
    return {
        id: result.repository.defaultBranchRef.id,
        oid: result.repository.defaultBranchRef.target.oid,
    };
}

export interface CreateCommitRequest {
    pat: string;
    head: RepoHead;
    message: string;
    additions: Array<{ path: string; content: string }>;
    deletions: Array<{ path: string }>;
}

export async function createCommit({
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

export interface Blob {
    path: string;
    sha: string;
}

export async function getTreeRecursive(
    config: Config,
    head: RepoHead,
): Promise<Blob[]> {
    const result: GetTreesResponse = await ghRest({
        pat: config.pat,
        pathAndQuery: `/repos/${config.repoOwner}/${config.repoName}/git/trees/${head.oid}?recursive=1`,
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

export async function getBlob(config: Config, blobSha: string): Promise<string> {
    const result: GetBlobResponse = await ghRest({
        pat: config.pat,
        pathAndQuery: `/repos/${config.repoOwner}/${config.repoName}/git/blobs/${blobSha}`,
        apiVersion: "2022-11-28",
    });
    if (result.encoding !== "base64") {
        throw new Error("unsupported encoding: " + result.encoding);
    }

    const decoder = new TextDecoder();
    return decoder.decode(Uint8Array.fromBase64(result.content));
}
