import { readFile } from "fs/promises";

export function serviceWorkerPlugin({ src, out }) {
    return {
        name: "service-worker-plugin",
        async generateBundle(_options, bundle) {
            const source = await readFile(src, "utf-8");
            const cacheName = `const CACHE_NAME = ${JSON.stringify(
                Date.now().toString()
            )};`;
            const assets = Object.keys(bundle);
            const cacheUrls = `const CACHE_URLS = ${JSON.stringify(assets)};`;

            this.emitFile({
                type: "asset",
                fileName: out,
                source: `${cacheName}\n${cacheUrls}\n${source}`
            });
        }
    };
}
