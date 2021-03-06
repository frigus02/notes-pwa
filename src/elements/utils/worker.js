import Worker from "worker-loader?name=worker-[hash].js!../../worker/index.js";
import { newId } from "../../shared/id.js";

class WorkerRequestManager {
    constructor() {
        this._requests = {};
        this._worker = new Worker();
        this._worker.addEventListener("message", e => {
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

    request(action, ...args) {
        const id = newId();
        return new Promise((resolve, reject) => {
            this._requests[id] = { resolve, reject };
            this._worker.postMessage({ id, action, args });
        });
    }
}

const instance = new WorkerRequestManager();

const markdownToHtml = markdown => instance.request("markdownToHtml", markdown);
const sync = accessToken => instance.request("sync", accessToken);

export { markdownToHtml, sync };
