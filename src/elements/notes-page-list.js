import NotesBaseElement, { html, until } from './notes-base-element.js';
import './notes-list.js';
import './notes-toolbar.js';
import router from './utils/router.js';
import storage from './utils/storage.js';
import sync from './utils/sync.js';

class NotesPageList extends NotesBaseElement {
	static get is() {
		return 'notes-page-list';
	}

	static get properties() {
		return {
			dataState: Object
		};
	}

	constructor() {
		super();
		this._createNote = this._createNote.bind(this);
		this._syncNotes = this._syncNotes.bind(this);
	}

	async _createNote() {
		const note = await storage.createNote();
		router.navigate(`/note/${note.id}`);
	}

	async _syncNotes() {
		try {
			if (!sync.isAuthenticated()) {
				await sync.authenticate();
			}

			await sync.sync();
			alert('Done :-)');
		} catch (e) {
			console.log(e);
			alert('Error :-(');
		}
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

			<notes-toolbar>
				Notes
				<button slot="actions" on-click="${this._syncNotes}">Sync</button>
				<button slot="actions" on-click="${this._createNote}">New note</button>
			</notes-toolbar>
			${until(notesList, 'Loading...')}
		`;
	}
}

customElements.define(NotesPageList.is, NotesPageList);
