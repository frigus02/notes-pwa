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
					--primary-color: #5d4037;
					--primary-color-light: #8b6b61;
					--primary-color-dark: #321911;
					--secondary-color: #2196f3;
					--secondary-color-light: #6ec6ff;
					--secondary-color-dark: #0069c0;
					--primary-text-color: #ffffff;
					--secondary-text-color: #000000;
					display: block;
					background: var(--primary-color);
					color: var(--primary-text-color);
				}
			</style>

			<h1>Notes App</h1>
		`;
	}
}

customElements.define('notes-app', NotesApp);
