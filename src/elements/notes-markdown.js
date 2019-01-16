import NotesBaseElement, {
    html,
    unsafeHTML,
    until
} from "./notes-base-element.js";
import { markdownToHtml } from "./utils/worker.js";

class NotesMarkdown extends NotesBaseElement {
    static get is() {
        return "notes-markdown";
    }

    static get properties() {
        return {
            value: String
        };
    }

    render({ value }) {
        const rendered = markdownToHtml(value).then(
            raw =>
                html`
                    ${unsafeHTML(raw)}
                `
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
}

customElements.define(NotesMarkdown.is, NotesMarkdown);
