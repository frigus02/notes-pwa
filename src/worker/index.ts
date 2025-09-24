import { render } from "./markdown.js";
import { syncAll, syncOne } from "./sync.js";

const actions = {
    markdownToHtml: render,
    syncAll,
    syncOne,
};

export type Action = keyof typeof actions;

interface MessageData {
    id: string;
    action: Action;
    args: [any, any];
}

addEventListener("message", async function (e) {
    const { id, action, args } = e.data as MessageData;
    try {
        const result = await actions[action](...args);
        postMessage({ id, result });
    } catch (error) {
        postMessage({ id, error });
    }
});
