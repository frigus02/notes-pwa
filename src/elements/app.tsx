import { computed } from "@preact/signals";
import { shortDate } from "../shared/format.js";
import { sync } from "./utils/sync.js";
import { useEffect } from "preact/hooks";
import { Note } from "./note.js";

const syncText = computed(() => {
    if (sync.state.value === "syncing") {
        return "syncing...";
    } else if (!sync.lastResult.value) {
        return "not synced";
    } else if (sync.lastResult.value.type === "success") {
        return `synced at ${shortDate(sync.lastResult.value.date)}`;
    } else {
        return `sync failed at ${shortDate(sync.lastResult.value.date)}: ${sync.lastResult.value.error.message}`;
    }
});

export function App() {
    useEffect(() => {
        sync.all();
    }, []);

    return (
        <>
            <Note />
            <div class="sync-state">{syncText}</div>
        </>
    );
}
