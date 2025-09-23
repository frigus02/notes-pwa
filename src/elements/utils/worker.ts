import type { Action } from "../../worker/index.js";
import { newId } from "../../shared/id.js";
import type { Note } from "../../shared/storage.js";

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

interface SyncError {
    type: "error";
    error: Error;
    date: Date;
}
interface SyncSucess {
    type: "success";
    date: Date;
}
type SyncResult = SyncError | SyncSucess;
class Sync extends EventTarget {
    private _state: "idle" | "syncing" = "idle";
    private _lastResult: SyncResult | undefined = undefined;

    get state() {
        return this._state;
    }

    get lastResult() {
        return this._lastResult;
    }

    all(): void {
        if (this._state === "syncing") {
            return;
        }

        // don't await
        this.start("syncAll");
    }

    one(note: Note): void {
        if (this._state === "syncing") {
            return;
        }

        // don't await
        this.start("syncOne", note);
    }

    private async start(type: "syncAll" | "syncOne", ...args: any[]) {
        try {
            this._state = "syncing";
            this.dispatchEvent(new Event("sync-start"));
            await instance.request(type, ...args);
            this._lastResult = { type: "success", date: new Date() };
        } catch (e) {
            const error = e instanceof Error ? e : new Error("error");
            this._lastResult = { type: "error", date: new Date(), error };
        } finally {
            this._state = "idle";
            this.dispatchEvent(new Event("sync-end"));
        }
    }
}

const markdownToHtml = (markdown: string): Promise<string> =>
    instance.request("markdownToHtml", markdown) as Promise<string>;

const sync = new Sync();

export { markdownToHtml, sync };
