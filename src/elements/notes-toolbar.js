import { makeWebComponent } from "function-web-components";
import { html, render } from "./notes-base-element.js";

function notesToolbar() {
    return html`
        <style>
            :host {
                display: block;
                height: 59px;
            }

            header {
                background: var(--primary-color);
                box-shadow: 0 3px 3px var(--divider-color);
                box-sizing: border-box;
                color: var(--primary-text-color-on-dark);
                height: 56px;
                line-height: 24px;
                padding: 16px;
                position: fixed;
                top: 0;
                width: 100%;
                display: flex;
                justify-content: space-between;
            }

            h1 {
                margin: 0;
                font-size: 20px;
            }
        </style>

        <header>
            <h1><slot></slot></h1>
            <div><slot name="actions"></slot></div>
        </header>
    `;
}

customElements.define(
    "notes-toolbar",
    makeWebComponent(notesToolbar, {
        render
    })
);
