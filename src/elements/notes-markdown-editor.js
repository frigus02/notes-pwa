import NotesBaseElement, { html } from "./notes-base-element.js";

class NotesMarkdownEditor extends NotesBaseElement {
    static get is() {
        return "notes-markdown-editor";
    }

    static get properties() {
        return {
            value: String
        };
    }

    _onChange(newValue) {
        this.dispatchEvent(
            new CustomEvent("change", {
                detail: newValue
            })
        );
    }

    render({ value }) {
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
                @input="${e => this._onChange(e.target.value)}"
                .value="${value}"
            ></textarea>
        `;
    }
}

customElements.define(NotesMarkdownEditor.is, NotesMarkdownEditor);
