import NotesBaseElement, { html } from './notes-base-element.js';
import './notes-toolbar.js';

class NotesPage404 extends NotesBaseElement {
	static get is() {
		return 'notes-page-404';
	}

	render() {
		return html`
			<style>
				:host {
					display: block;
				}

                p {
                    margin: 0;
                    padding: 8px 16px;
                }
			</style>

			<notes-toolbar>Not found</notes-toolbar>
			<p>Whooops. This page does not exist. I suggest you <a href="/">start again</a>.</p>
		`;
	}
}

customElements.define(NotesPage404.is, NotesPage404);
