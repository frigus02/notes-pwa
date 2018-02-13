import NotesBaseElement, { html } from './notes-base-element.js';
import './notes-details.js';
import './notes-toolbar.js';

class NotesPageNote extends NotesBaseElement {
	static get is() {
		return 'notes-page-note';
	}

	static get properties() {
		return {
			dataState: Object
		};
	}

	render({ dataState }) {
		const noteId = parseInt(dataState.noteId, 10);
		const note = dataState.notes.find(n => n.id === noteId);
		return html`
			<style>
				:host {
					display: block;
				}
			</style>

			<notes-toolbar dataTitle="${note.title}"></notes-toolbar>
			<notes-details dataNote="${note}"></notes-details>
		`;
	}
}

customElements.define(NotesPageNote.is, NotesPageNote);
