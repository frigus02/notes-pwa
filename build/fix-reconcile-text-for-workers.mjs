import { readFile, writeFile } from "fs/promises";

const path = "./node_modules/reconcile-text/dist/reconcile.web.js";
const code = await readFile(path, "utf8");
const fixed = code.replace(
    "__webpack_require__.b = document.baseURI || self.location.href;",
    "__webpack_require__.b = self.location.href;",
);
if (fixed === code) {
    throw new Error("fix didn't work");
}
await writeFile(path, fixed, "utf8");
