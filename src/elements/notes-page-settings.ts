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
                        GitHub Personal Access Token. Requires scopes: Contents
                        read and write
                    </div>
                </fieldset>
                <fieldset>
                    <label for="gh-repo-owner">GitHub Repo Owner</label>
                    <input
                        id="gh-repo-owner"
                        name="gh-repo-owner"
                        value=${settings.gitHubRepoOwner ?? ""}
                    />
                </fieldset>
                <fieldset>
                    <label for="gh-repo-name">GitHub Repo Name</label>
                    <input
                        id="gh-repo-name"
                        name="gh-repo-name"
                        value=${settings.gitHubRepoName ?? ""}
                    />
                </fieldset>
                <input type="submit" value="Save" />
            </form>
        `,
    );

    async function onSubmit(e: Event) {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        const settings = {
            gitHubPat: (data.get("gh-pat") as string | null)?.trim() ?? "",
            gitHubRepoOwner:
                (data.get("gh-repo-owner") as string | null)?.trim() ?? "",
            gitHubRepoName:
                (data.get("gh-repo-name") as string | null)?.trim() ?? "",
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
