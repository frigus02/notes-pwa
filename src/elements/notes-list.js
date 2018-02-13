import NotesBaseElement, { html, repeat } from './notes-base-element.js';

class NotesList extends NotesBaseElement {
	static get is() {
		return 'notes-list';
	}

	static get properties() {
		return {
			dataNotes: Array
		};
	}

	render({ dataNotes }) {
		return html`
			<style>
				:host {
					display: block;
				}

				.list {
					margin: 0;
					padding: 0;
					list-style-type: none;
				}

				.note-item:not(:last-child) {
					border-bottom: 1px solid var(--divider-color);
				}

				.note-item a {
					color: var(--primary-text-color);
					display: block;
					padding: 8px 16px;
					text-decoration: none;
				}

				.note-item a:hover,
				.note-item a:active {
					background: rgba(0, 0, 0, 0.1);
				}

				.note-item h2 {
					margin: 0;
					font-size: 16px;
					font-weight: normal;
				}

				.note-item p {
					margin: 0;
					color: var(--secondary-text-color);
				}
			</style>

            <ul class="list">
                ${repeat(dataNotes, note => note.id, note => html`
					<li class="note-item">
						<a href="/note/${note.id}">
							<h2>${note.title}</h2>
							<p>${note.summary} - ${note.modified}</p>
						</a>
                    </li>
                `)}
            </ul>
		`;
	}
}

customElements.define(NotesList.is, NotesList);
