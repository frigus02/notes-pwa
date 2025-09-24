import preact from "@preact/preset-vite";
import { serviceWorkerPlugin } from "./build/service-worker-plugin";

/** @type {import('vite').UserConfig} */
export default {
    root: "src",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
    },
    plugins: [
        preact(),
        serviceWorkerPlugin({ src: "src/sw.js", out: "sw.js" }),
    ],
};
