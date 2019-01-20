import { makeWebComponent } from "function-web-components";
import { html, render } from "./notes-base-element.js";
import "./notes-markdown.js";

import { timeAgo } from "../shared/format.js";

function notesDetails({ dataNote }) {
    if (!dataNote) return;
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

            .metadata {
                color: var(--secondary-text-color);
                font-size: 12px;
                margin-bottom: 16px;
            }
        </style>

        <h2>${dataNote.title}</h2>
        <div class="metadata">Modified: ${timeAgo(dataNote.modified)}</div>
        <notes-markdown .value="${dataNote.body}"></notes-markdown>
    `;
}

customElements.define(
    "notes-details",
    makeWebComponent(notesDetails, {
        props: ["dataNote"],
        render
    })
);
