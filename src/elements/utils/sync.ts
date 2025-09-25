import type { Note } from "../../shared/storage.js";
import { computed, signal } from "@preact/signals";
import { syncAll, syncOne } from "./worker-request.js";

interface SyncError {
    type: "error";
    error: Error;
    date: Date;
}
interface SyncSucess {
    type: "success";
    date: Date;
}
type SyncResult = SyncError | SyncSucess;
type SyncState = "idle" | "syncing";

class Sync {
    private readonly _state = signal<SyncState>("idle");
    private readonly _lastResult = signal<SyncResult | undefined>(undefined);

    readonly state = computed(() => this._state.value);
    readonly lastResult = computed(() => this._lastResult.value);

    all(): void {
        if (this.state.value === "syncing") {
            return;
        }

        // don't await
        this.start(() => syncAll());
    }

    one(note: Note, oldNote: Note | undefined): void {
        if (this.state.value === "syncing") {
            return;
        }

        // don't await
        this.start(() => syncOne(note, oldNote));
    }

    private async start(cb: () => Promise<void>) {
        try {
            this._state.value = "syncing";
            await cb();
            this._lastResult.value = { type: "success", date: new Date() };
        } catch (e) {
            const error = e instanceof Error ? e : new Error(String(e));
            this._lastResult.value = { type: "error", date: new Date(), error };
        } finally {
            this._state.value = "idle";
        }
    }
}

export const sync = new Sync();
