import { serviceWorkerPlugin } from "./build/service-worker-plugin";

/** @type {import('vite').UserConfig} */
export default {
    root: "src",
    build: {
        outDir: "../dist",
        emptyOutDir: true
    },
    plugins: [serviceWorkerPlugin({ src: "src/sw.js", out: "sw.js" })]
};
