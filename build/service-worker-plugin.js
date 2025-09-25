import { readFile } from "fs/promises";

export function serviceWorkerPlugin({ src, out }) {
    return {
        name: "service-worker-plugin",
        async generateBundle(_options, bundle) {
            const source = await readFile(src, "utf-8");
            const cacheName = `const CACHE_NAME = ${JSON.stringify(
                Date.now().toString(),
            )};`;
            const assets = Object.keys(bundle).map((a) => "/" + a);
            assets.push(
                "/",
                "/favicon.ico",
                "/images/icon_144x144.png",
                "/images/icon_152x152.png",
                "/images/icon_168x168.png",
                "/images/icon_16x16.png",
                "/images/icon_192x192.png",
                "/images/icon_32x32.png",
                "/images/icon_48x48.png",
                "/images/icon_72x72.png",
                "/images/icon_96x96.png",
                "/manifest.webmanifest",
            );
            assets.sort();
            const cacheUrls = `const CACHE_URLS = ${JSON.stringify(assets)};`;

            this.emitFile({
                type: "asset",
                fileName: out,
                source: `${cacheName}\n${cacheUrls}\n${source}`,
            });
        },
    };
}
