import NotesBaseElement, { html } from './notes-base-element.js';

class NotesApp extends NotesBaseElement {
	static get is() {
		return 'notes-app';
	}

	static get properties() {
		return {
			picture: String,
			text: String,
		}
	}

	render({ picture, text }) {
		return html`
			<style>
				:host {
					--pink: #f44289;
					display: block;
					background: var(--pink);
				}
			</style>

			<h1>Notes App</h1>
		`;
	}
}

customElements.define('notes-app', NotesApp);
