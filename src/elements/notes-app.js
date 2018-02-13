import NotesBaseElement, { html, repeat } from './notes-base-element.js';
import { cssColors } from '../utils/colors.js';


class NotesApp extends NotesBaseElement {
	static get is() {
		return 'notes-app';
	}

	static get properties() {
		return {
			notes: Array
		};
	}

	constructor() {
		super();
		this.notes = [
			{ id: 1, title: 'Essen', summary: '- Spaghetti Napoli', modified: '2 days ago' },
			{ id: 2, title: 'Wi-Fi', summary: 'My Net', modified: '20 days ago' },
			{ id: 3, title: 'To-do', summary: 'Nothing', modified: '21 days ago' },
			{ id: 4, title: 'Lifehacks', summary: '...', modified: '30 days ago' }
		];
	}

	render({ notes }) {
		return html`
			${cssColors}
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

				.notes-list {
					margin: 0;
					padding: 0;
					list-style-type: none;
				}

				.note {
					padding: 8px 16px;
				}

				.note:not(:last-child) {
					border-bottom: 1px solid var(--divider-color);
				}

				.note h2 {
					margin: 0;
					font-size: 16px;
					font-weight: normal;
				}

				.note p {
					margin: 0;
					color: var(--secondary-text-color);
				}
			</style>

			<header>
				<h1>Notes</h1>
			</header>
			<section>
				<ul class="notes-list">
					${repeat(notes, note => note.id, note => html`
						<li class="note">
							<h2>${note.title}</h2>
							<p>${note.summary} - ${note.modified}</p>
						</li>
					`)}
				</ul>
			</section>
		`;
	}
}

customElements.define('notes-app', NotesApp);
