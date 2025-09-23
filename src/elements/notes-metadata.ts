import { makeWebComponent } from "function-web-components";
import { html, render } from "./notes-base-element.js";
import "./notes-markdown.js";

import { timeAgo } from "../shared/format.js";

interface Props {
    [key: string]: any;
}

function notesMetadata({ dataNote }: Props) {
    if (!dataNote) return;
    const synced = dataNote.pendingSync
        ? "requires merge"
        : dataNote.lastSync?.body === dataNote.body
          ? "synced"
          : "modified";
    return html`
        <style>
            :host {
                display: block;
                padding: 8px 0;
                color: var(--secondary-text-color);
                font-size: 12px;
                margin-bottom: 16px;
            }

            dl {
                margin: 0;
            }

            dt {
                display: inline;
            }

            dd {
                margin: 0;
                display: inline;
            }

            dd:not(:last-child)::after {
                content: " | ";
            }
        </style>

        <dl>
            <dt>Modified:</dt>
            <dd>${timeAgo(dataNote.modified.getTime())}</dd>
            <dt>Sync:</dt>
            <dd>${synced}</dd>
        </dl>
    `;
}

customElements.define(
    "notes-metadata",
    makeWebComponent(notesMetadata, {
        props: ["dataNote"],
        render,
    }),
);
