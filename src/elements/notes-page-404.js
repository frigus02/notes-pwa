import { makeWebComponent } from "function-web-components";
import { html, render } from "./notes-base-element.js";
import "./notes-toolbar.js";

function notesPage404() {
    return html`
        <style>
            :host {
                display: block;
            }

            p {
                margin: 0;
                padding: 8px 16px;
            }
        </style>

        <notes-toolbar>Not found</notes-toolbar>
        <p>
            Whooops. This page does not exist. I suggest you
            <a href="/">start again</a>.
        </p>
    `;
}

customElements.define(
    "notes-page-404",
    makeWebComponent(notesPage404, {
        render
    })
);
