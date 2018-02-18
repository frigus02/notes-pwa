import marked from 'marked/lib/marked.js';
import sync from './sync.js';

marked.setOptions({
    gfm: true,
    tables: false,
    breaks: true
});

const actions = {
    markdownToHtml: marked,
    sync
};

addEventListener('message', async function (e) {
    const { id, action, args } = e.data;
    try {
        const result = await actions[action](...args);
        postMessage({ id, result });
    } catch (error) {
        postMessage({ id, error });
    }
});
