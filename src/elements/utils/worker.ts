import type { Action } from "../../worker/index.js";
import type { Options as SyncOptions } from "../../worker/sync.js";
import { newId } from "../../shared/id.js";

class WorkerRequestManager {
    private _requests: Record<
        string,
        { resolve: (result: unknown) => void; reject: (error: unknown) => void }
    >;
    private _worker: Worker;

    constructor() {
        this._requests = {};
        this._worker = new Worker(
            new URL("../../worker/index.js", import.meta.url),
            { type: "module" },
        );
        this._worker.addEventListener("message", (e) => {
            const { id, result, error } = e.data;
            const request = this._requests[id];
            delete this._requests[id];
            if (error) {
                request.reject(error);
            } else {
                request.resolve(result);
            }
        });
    }

    request(action: Action, ...args: any[]) {
        const id = newId();
        return new Promise((resolve, reject) => {
            this._requests[id] = { resolve, reject };
            this._worker.postMessage({ id, action, args });
        });
    }
}

const instance = new WorkerRequestManager();

const markdownToHtml = (markdown: string): Promise<string> =>
    instance.request("markdownToHtml", markdown) as Promise<string>;
const sync = (options: SyncOptions): Promise<void> =>
    instance.request("sync", options) as Promise<void>;

export { markdownToHtml, sync };
