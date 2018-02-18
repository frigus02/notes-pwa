import NotesBaseElement, { html } from './notes-base-element.js';
import './notes-markdown-editor.js';
import { timeAgo } from './utils/format.js';

class NotesDetails extends NotesBaseElement {
	static get is() {
		return 'notes-details';
	}

	static get properties() {
		return {
			dataNote: Object
		};
	}

	_onChange(changedProps) {
		this.dataNote = Object.assign({}, this.dataNote, changedProps);
		this.dispatchEvent(new CustomEvent('change', {
			detail: this.dataNote
		}));
	}

	render({ dataNote }) {
		if (!dataNote) return;
		return html`
			<style>
				:host {
					display: block;
					padding: 8px 16px;
				}

				h2 {
					margin: 0 0 4px;
				}

				h2 input {
					border: none;
					border-bottom: 1px solid var(--divider-color);
					font-size: 18px;
					width: 100%;
				}

				.metadata {
					color: var(--secondary-text-color);
					font-size: 12px;
					margin-bottom: 16px;
				}

				textarea {
					width: 100%;
					resize: vertical;
				}
			</style>

            <h2>
				<input
					aria-label="Note title"
					type="text"
					value="${dataNote.title}"
					on-change="${e => this._onChange({ title: e.target.value })}">
			</h2>
			<div class="metadata">
				Modified: ${timeAgo(dataNote.modified)}
			</div>
			<notes-markdown-editor
				aria-label="Note content"
				value="${dataNote.body}"
				on-change="${e => this._onChange({ body: e.target.value })}"></notes-markdown-editor>
		`;
	}
}

customElements.define(NotesDetails.is, NotesDetails);
