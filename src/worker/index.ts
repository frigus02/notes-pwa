import { marked } from "marked";
import { sync } from "./sync.js";

marked.setOptions({
    gfm: true,
    breaks: true,
});

const actions = {
    markdownToHtml: marked,
    sync,
};

export type Action = keyof typeof actions;

interface MessageData {
    id: string;
    action: Action;
    args: [any];
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
