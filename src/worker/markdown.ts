import { marked } from "marked";

function isAbsolute(href: string) {
    return /^https?:\/\//.test(href);
}

export async function render(source: string): Promise<string> {
    return await marked(source, {
        gfm: true,
        breaks: true,
        walkTokens(token) {
            if (token.type === "link" && !isAbsolute(token.href)) {
                if (!token.href.startsWith("/")) {
                    token.href = "/" + token.href;
                }
                token.href = "/view" + token.href;
            }
        },
    });
}
