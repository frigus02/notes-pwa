import { makeWebComponent } from "function-web-components";
import { html, render, unsafeHTML, until } from "./notes-base-element.js";
import { markdownToHtml } from "./utils/worker.js";

function notesMarkdown({ value }) {
    const rendered = markdownToHtml(value).then(
        raw =>
            html`
                ${unsafeHTML(raw)}
            `
    );

    return html`
        <style>
            :host {
                display: block;
            }
        </style>

        ${until(rendered, "Loading...")}
    `;
}

customElements.define(
    "notes-markdown",
    makeWebComponent(notesMarkdown, render)
);
