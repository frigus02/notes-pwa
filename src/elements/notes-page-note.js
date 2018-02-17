import NotesBaseElement, { html, until } from './notes-base-element.js';
import './notes-details.js';
import './notes-toolbar.js';
import storage from './utils/storage.js';

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
		const noteDetails = storage.getNote(noteId).then(note =>
			html`<notes-details dataNote="${note}"></notes-details>`);

		return html`
			<style>
				:host {
					display: block;
				}
			</style>

			<notes-toolbar dataTitle="Notes"></notes-toolbar>
			${until(noteDetails, 'Loading...')}
		`;
	}
}

customElements.define(NotesPageNote.is, NotesPageNote);
