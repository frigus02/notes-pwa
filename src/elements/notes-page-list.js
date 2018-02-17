import NotesBaseElement, { html, until } from './notes-base-element.js';
import './notes-list.js';
import './notes-toolbar.js';
import storage from './utils/storage.js';

class NotesPageList extends NotesBaseElement {
	static get is() {
		return 'notes-page-list';
	}

	static get properties() {
		return {
			dataState: Object
		};
	}

	render() {
		const notesList = storage.getNotes().then(notes =>
			html`<notes-list dataNotes="${notes}"></notes-list>`);

		return html`
			<style>
				:host {
					display: block;
				}
			</style>

			<notes-toolbar dataTitle="${"Notes"}"></notes-toolbar>
			${until(notesList, 'Loading...')}
		`;
	}
}

customElements.define(NotesPageList.is, NotesPageList);
