import NotesBaseElement, { html } from "./notes-base-element.js";
import "./notes-markdown-editor.js";

import { timeAgo } from "../shared/format.js";

class NotesDetailsEdit extends NotesBaseElement {
    static get is() {
        return "notes-details-edit";
    }

    static get properties() {
        return {
            dataNote: Object
        };
    }

    _onChange(changedProps) {
        this.dataNote = Object.assign({}, this.dataNote, changedProps);
        this.dispatchEvent(
            new CustomEvent("change", {
                detail: this.dataNote
            })
        );
    }

    render({ dataNote }) {
        if (!dataNote) return;
        return html`
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    padding: 8px 16px;
                }

                h2 {
                    margin: 0 0 4px;
                }

                h2 input {
                    border: none;
                    border-bottom: 1px solid var(--divider-color);
                    font-size: 18px;
                    padding: 1px;
                    width: 100%;
                }

                .metadata {
                    color: var(--secondary-text-color);
                    font-size: 12px;
                    margin-bottom: 16px;
                }

                notes-markdown-editor {
                    flex: 1;
                }
            </style>

            <h2>
                <input
                    aria-label="Note title"
                    type="text"
                    value="${dataNote.title}"
                    @change="${e => this._onChange({ title: e.target.value })}"
                />
            </h2>
            <div class="metadata">Modified: ${timeAgo(dataNote.modified)}</div>
            <notes-markdown-editor
                aria-label="Note content"
                .value="${dataNote.body}"
                @change="${e => this._onChange({ body: e.detail })}"
            ></notes-markdown-editor>
        `;
    }
}

customElements.define(NotesDetailsEdit.is, NotesDetailsEdit);
