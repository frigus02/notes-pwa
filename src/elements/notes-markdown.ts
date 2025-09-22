import { makeWebComponent } from "function-web-components";
import { html, render, unsafeHTML, until } from "./notes-base-element.js";
import { markdownToHtml } from "./utils/worker.js";

interface Props {
    [key: string]: any;
}

function notesMarkdown({ value }: Props) {
    const rendered = markdownToHtml(value).then(
        (raw) => html` ${unsafeHTML(raw)} `,
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
    makeWebComponent(notesMarkdown, {
        attrs: ["value"],
        render,
    }),
);
