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
					height: 59px;
				}

				header {
					background: var(--primary-color);
					box-shadow: 0 3px 3px var(--divider-color);
					box-sizing: border-box;
					color: var(--primary-text-color-on-dark);
					height: 56px;
					line-height: 24px;
					padding: 16px;
					position: fixed;
					top: 0;
					width: 100%;
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
