import { LitElement } from '@polymer/lit-element/lit-element.js'
import { html } from 'lit-html/lib/lit-extended.js';

class NotesApp extends LitElement {
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

					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;

					background: var(--pink);
				}
			</style>

			<h1>Notes App</h1>
		`;
	}
}

customElements.define('notes-app', NotesApp);
