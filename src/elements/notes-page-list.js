import NotesBaseElement, { html } from './notes-base-element.js';
import './notes-list.js';
import './notes-toolbar.js';

class NotesPageList extends NotesBaseElement {
	static get is() {
		return 'notes-page-list';
	}

	static get properties() {
		return {
			dataState: Array
		};
	}

	render({ dataState }) {
		return html`
			<style>
				:host {
					display: block;
				}
			</style>

			<notes-toolbar dataTitle="${"Notes"}"></notes-toolbar>
			<notes-list dataNotes="${dataState.notes}"></notes-list>
		`;
	}
}

customElements.define(NotesPageList.is, NotesPageList);
