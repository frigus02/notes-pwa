import { makeWebComponent } from "function-web-components";
import { html, render } from "./notes-base-element.js";

function notesMarkdownEditor({ value, setValue }) {
    const onChange = newValue => {
        setValue(newValue, { eventName: "change" });
    };

    return html`
        <style>
            :host {
                display: block;
            }

            textarea {
                width: 100%;
                height: 100%;
                resize: none;
                box-sizing: border-box;
            }
        </style>

        <textarea
            @input="${e => onChange(e.target.value)}"
            .value="${value}"
        ></textarea>
    `;
}

customElements.define(
    "notes-markdown-editor",
    makeWebComponent(notesMarkdownEditor, {
        attrs: ["value"],
        render
    })
);
