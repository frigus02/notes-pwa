import { useState } from "preact/hooks";
import storage from "../shared/storage.js";
import { useQuery } from "./utils/use-query.js";
import type { RefCallback } from "preact";

interface Props {
    visible: boolean;
    dialogRef: RefCallback<HTMLDialogElement>;
}

export function useSettingsDialog() {
    const [visible, setVisible] = useState(false);
    const dialogRef: RefCallback<HTMLDialogElement> = (dialog) => {
        if (!dialog) return;
        dialog.addEventListener("close", () => setVisible(false));
        dialog.showModal();
    };
    const props: Props = { visible, dialogRef };
    const open = () => void setVisible(true);
    return [props, open] as const;
}

export function SettingsDialog({ visible, dialogRef }: Props) {
    return visible ? (
        <dialog ref={dialogRef}>
            <SettingsDialogContent />
        </dialog>
    ) : null;
}

function SettingsDialogContent() {
    const settings = useQuery(() => storage.loadSettings(), []);
    if (!settings) {
        return <div>Loading...</div>;
    }

    async function onSubmit(e: Event) {
        const data = new FormData(e.target as HTMLFormElement);
        const settings = {
            gitHubPat: (data.get("gh-pat") as string | null)?.trim() ?? "",
            gitHubRepoOwner:
                (data.get("gh-repo-owner") as string | null)?.trim() ?? "",
            gitHubRepoName:
                (data.get("gh-repo-name") as string | null)?.trim() ?? "",
        };
        await storage.saveSettings(settings);
    }

    return (
        <form class="settings" method="dialog" onSubmit={onSubmit}>
            <h1>Settings</h1>
            <div class="field">
                <label for="gh-pat">GitHub PAT</label>
                <input
                    id="gh-pat"
                    name="gh-pat"
                    aria-describedby="gh-pat-hint"
                    defaultValue={settings.gitHubPat}
                />
                <div class="hint" id="gh-pat-hint">
                    GitHub Personal Access Token. Requires scopes: Contents read
                    and write
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
    );
}
