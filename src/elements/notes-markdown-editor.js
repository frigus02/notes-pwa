import htmlToMarkdown from "./utils/html-to-markdown.js";
import { markdownToHtml } from "./utils/worker.js";

class NotesMarkdownEditor extends HTMLElement {
    static get is() {
        return "notes-markdown-editor";
    }

    constructor() {
        super();
        this._value = "";
        this._onDivChange = this._onDivChange.bind(this);
        this._onDivFocus = this._onDivFocus.bind(this);
        this._onDivKeydown = this._onDivKeydown.bind(this);
    }

    get value() {
        return this._value;
    }

    set value(value) {
        if (this._value !== value) {
            this._value = value;
            if (this._div) {
                markdownToHtml(this._value).then(html => {
                    this._div.innerHTML = html;
                });
            }
        }
    }

    async _onDivChange() {
        const result = htmlToMarkdown(this._div);
        this._value = result.markdown;
        if (result.removedInvalidNodes) {
            this._div.innerHTML = await markdownToHtml(this._value);
        }

        this.dispatchEvent(
            new CustomEvent("change", {
                detail: this._value
            })
        );
    }

    _onDivFocus() {
        window.document.execCommand("defaultParagraphSeparator", false, "p");
    }

    _onDivKeydown(e) {
        let preventDefault = true;
        if (e.key === "b" && e.ctrlKey) {
            window.document.execCommand("bold");
        } else if (e.key === "i" && e.ctrlKey) {
            window.document.execCommand("italic");
        } else if (e.key === "k" && e.ctrlKey) {
            const link = prompt("Enter URL");
            if (link) {
                window.document.execCommand("createLink", false, link);
            } else {
                window.document.execCommand("unlink");
            }
        } else if (e.code === "Digit1" && e.ctrlKey && e.altKey) {
            window.document.execCommand("formatBlock", false, "H1");
        } else if (e.code === "Digit2" && e.ctrlKey && e.altKey) {
            window.document.execCommand("formatBlock", false, "H2");
        } else if (e.code === "Digit3" && e.ctrlKey && e.altKey) {
            window.document.execCommand("formatBlock", false, "H3");
        } else if (e.code === "Digit7" && e.ctrlKey && e.shiftKey) {
            window.document.execCommand("insertOrderedList");
        } else if (e.code === "Digit8" && e.ctrlKey && e.shiftKey) {
            window.document.execCommand("insertUnorderedList");
        } else if (
            (e.code === "Digit0" || e.key === "\\") &&
            e.ctrlKey &&
            e.altKey
        ) {
            window.document.execCommand("removeFormat");
        } else {
            preventDefault = false;
        }

        if (preventDefault) {
            e.preventDefault();
        }
    }

    connectedCallback() {
        if (!this.shadowRoot) {
            this.style.display = "block";

            this.attachShadow({ mode: "open" });
            this._div = document.createElement("div");
            this._div.setAttribute("contenteditable", "true");
            this.shadowRoot.appendChild(this._div);

            markdownToHtml(this._value).then(html => {
                this._div.innerHTML = html;
            });
        }

        this._div.addEventListener("input", this._onDivChange);
        this._div.addEventListener("focus", this._onDivFocus);
        this._div.addEventListener("keydown", this._onDivKeydown);
    }

    disconnectedCallback() {
        this._div.removeEventListener("input", this._onDivChange);
        this._div.removeEventListener("focus", this._onDivFocus);
        this._div.removeEventListener("keydown", this._onDivKeydown);
    }
}

customElements.define(NotesMarkdownEditor.is, NotesMarkdownEditor);
