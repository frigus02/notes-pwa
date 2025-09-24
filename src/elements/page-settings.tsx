import storage from "../shared/storage.js";
import { Toolbar } from "./toolbar.js";
import { useLocation } from "preact-iso";
import { useQuery } from "./utils/use-query.js";

export function SettingsPage() {
    const settings = useQuery(() => storage.loadSettings(), []);
    const location = useLocation();

    if (!settings) {
        return <Toolbar title="Settings" />;
    }

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
        location.route("/");
    }

    return (
        <>
            <Toolbar title="Settings" />
            <form class="settings" onSubmit={onSubmit}>
                <div class="field">
                    <label for="gh-pat">GitHub PAT</label>
                    <input
                        id="gh-pat"
                        name="gh-pat"
                        aria-describedby="gh-pat-hint"
                        defaultValue={settings.gitHubPat}
                    />
                    <div class="hint" id="gh-pat-hint">
                        GitHub Personal Access Token. Requires scopes: Contents
                        read and write
                    </div>
                </div>
                <div class="field">
                    <label for="gh-repo-owner">GitHub Repo Owner</label>
                    <input
                        id="gh-repo-owner"
                        name="gh-repo-owner"
                        defaultValue={settings.gitHubRepoOwner}
                    />
                </div>
                <div class="field">
                    <label for="gh-repo-name">GitHub Repo Name</label>
                    <input
                        id="gh-repo-name"
                        name="gh-repo-name"
                        defaultValue={settings.gitHubRepoName}
                    />
                </div>
                <input type="submit" value="Save" />
            </form>
        </>
    );
}
