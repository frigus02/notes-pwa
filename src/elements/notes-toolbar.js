import NotesBaseElement, { html } from './notes-base-element.js';

class NotesToolbar extends NotesBaseElement {
	static get is() {
		return 'notes-toolbar';
	}

	static get properties() {
		return {
			dataTitle: String
		};
	}

	render({ dataTitle }) {
		return html`
			<style>
				:host {
					display: block;
				}

				header {
					background: var(--primary-color);
					color: var(--primary-text-color-on-dark);
					padding: 16px;
					box-shadow: 0 3px 3px var(--divider-color);
					margin-bottom: 3px;
				}

				h1 {
					margin: 0;
					font-size: 20px;
				}
			</style>

			<header>
				<h1>${dataTitle}</h1>
			</header>
		`;
	}
}

customElements.define(NotesToolbar.is, NotesToolbar);
