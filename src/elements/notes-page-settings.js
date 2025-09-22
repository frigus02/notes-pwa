import { makeWebComponent } from "function-web-components";
import { html, render, until } from "./notes-base-element.js";
import "./notes-toolbar.js";
import router from "./utils/router.js";

import storage from "../shared/storage.js";

function notesPageSettings() {
    const form = storage.loadSettings().then(
        (settings) => html`
            <form @submit="${onSubmit}">
                <fieldset>
                    <label for="gh-pat">GitHub PAT</label>
                    <input
                        id="gh-pat"
                        name="gh-pat"
                        value=${settings.gitHubPat ?? ""}
                        aria-describedby="gh-pat-hint"
                    />
                    <div class="hint" id="gh-pat-hint">
                        GitHub Personal Access Token. Requires scopes: a, b, c
                    </div>
                </fieldset>
                <input type="submit" value="Save" />
            </form>
        `,
    );

    async function onSubmit(e) {
        e.preventDefault();
        const data = new FormData(e.target);
        const settings = {
            gitHubPat: data.get("gh-pat").trim(),
        };
        await storage.saveSettings(settings);
        router.navigate("/");
    }

    return html`
        <style>
            :host {
                display: block;
            }

            input {
                display: block;
            }

            .hint {
                font-size: small;
            }
        </style>

        <notes-toolbar>Settings</notes-toolbar>
        ${until(form, "Loading...")}
    `;
}

customElements.define(
    "notes-page-settings",
    makeWebComponent(notesPageSettings, {
        render,
    }),
);
