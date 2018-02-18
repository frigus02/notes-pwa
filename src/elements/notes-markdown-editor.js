import marked from 'marked/lib/marked.js';
import htmlToMarkdown from './utils/html-to-markdown.js';

marked.setOptions({
    gfm: true,
    tables: false,
    breaks: true
});

class NotesMarkdwnEditor extends HTMLElement {
    static get is() {
        return 'notes-markdown-editor';
    }

    constructor() {
        super();
        this._value = '';
        this._onDivChange = this._onDivChange.bind(this);
        this._onDivFocus = this._onDivFocus.bind(this);
    }

    get value() {
        return this._value;
    }

    set value(value) {
        if (this._value !== value) {
            this._value = value;
            if (this._div) {
                this._div.innerHTML = marked(this._value);
            }
        }
    }

    _onDivFocus() {
        window.document.execCommand('defaultParagraphSeparator', false, 'p');
    }

    _onDivChange(e) {
        const result = htmlToMarkdown(this._div);
        this._value = result.markdown;
        if (result.removedInvalidNodes) {
            this._div.innerHTML = marked(this._value);
        }

        this.dispatchEvent(new CustomEvent('change', {
            detail: this._value
        }));
    }

    connectedCallback() {
        if (!this.shadowRoot) {
            this.style.display = 'block';

            this.attachShadow({ mode: 'open' });
            this._div = document.createElement('div');
            this._div.setAttribute('contenteditable', 'true');
            this._div.innerHTML = marked(this._value);
            this.shadowRoot.appendChild(this._div);
        }

        this._div.addEventListener('input', this._onDivChange);
        this._div.addEventListener('focus', this._onDivFocus);
    }

    disconnectedCallback() {
        this._div.removeEventListener('input', this._onDivChange);
        this._div.removeEventListener('focus', this._onDivFocus);
    }
}

customElements.define(NotesMarkdwnEditor.is, NotesMarkdwnEditor);
