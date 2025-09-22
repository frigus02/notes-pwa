import { makeWebComponent } from "function-web-components";
import { html, render } from "./notes-base-element.js";

interface Props {
    [key: string]: any;
}

function notesMarkdownEditor({ value, setValue }: Props) {
    const onChange = (newValue: string) => {
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
            @input="${(e: Event) =>
                onChange((e.target as HTMLTextAreaElement).value)}"
            .value="${value}"
        ></textarea>
    `;
}

customElements.define(
    "notes-markdown-editor",
    makeWebComponent(notesMarkdownEditor, {
        attrs: ["value"],
        render,
    }),
);
