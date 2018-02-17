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
		const noteDetails = storage.getNote(dataState.noteId).then(note => {
			const onChange = async e => {
				const updatedNote = e.detail;
				await storage.updateNote(updatedNote);
			};

			return html`<notes-details dataNote="${note}" on-change="${onChange}"></notes-details>`;
		});

		return html`
			<style>
				:host {
					display: block;
				}
			</style>

			<notes-toolbar>Notes</notes-toolbar>
			${until(noteDetails, 'Loading...')}
		`;
	}
}

customElements.define(NotesPageNote.is, NotesPageNote);
