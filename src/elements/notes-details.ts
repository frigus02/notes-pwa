import { makeWebComponent } from "function-web-components";
import { html, render } from "./notes-base-element.js";
import "./notes-markdown.js";
import "./notes-metadata.js";

import { splitNote } from "../shared/format.js";

interface Props {
    [key: string]: any;
}

function notesDetails({ dataNote }: Props) {
    if (!dataNote) return;

    const [_title, body] = splitNote(dataNote);

    return html`
        <style>
            :host {
                display: block;
                padding: 8px 16px;
            }

            h2 {
                margin: 0 0 4px;
                padding: 1px;
                font-size: 18px;
                border-bottom: 1px solid var(--divider-color);
            }
        </style>

        <notes-metadata .dataNote="${dataNote}"></notes-metadata>
        <notes-markdown .value="${body}"></notes-markdown>
    `;
}

customElements.define(
    "notes-details",
    makeWebComponent(notesDetails, {
        props: ["dataNote"],
        render,
    }),
);
