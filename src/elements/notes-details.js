import NotesBaseElement, { html } from './notes-base-element.js';

class NotesDetails extends NotesBaseElement {
	static get is() {
		return 'notes-details';
	}

	static get properties() {
		return {
			dataNote: Object
		};
	}

	render({ dataNote }) {
		if (!dataNote) return;
		return html`
			<style>
				:host {
					display: block;
					padding: 8px 16px;
				}
			</style>

            <h2>${dataNote.title}</h2>
            <p>${dataNote.summary}</p>
		`;
	}
}

customElements.define(NotesDetails.is, NotesDetails);
