import { computed } from "@preact/signals";
import { shortDate } from "../shared/format.js";
import { sync } from "./utils/sync.js";
import {
    lazy,
    LocationProvider,
    ErrorBoundary,
    Router,
    Route,
} from "preact-iso";
import { useEffect } from "preact/hooks";

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

const ListPage = lazy(() => import("./page-list.js").then((m) => m.ListPage));
const NotePage = lazy(() => import("./page-note.js").then((m) => m.NotePage));
const EditPage = lazy(() => import("./page-edit.js").then((m) => m.EditPage));
const NotFoundPage = lazy(() =>
    import("./page-404.js").then((m) => m.NotFoundPage),
);

export function App() {
    useEffect(() => {
        sync.all();
    }, []);

    return (
        <LocationProvider>
            <ErrorBoundary>
                <Router>
                    <Route path="/" component={ListPage} />
                    <Route path="/view/:path+" component={NotePage} />
                    <Route path="/edit/:path+" component={EditPage} />
                    <Route default component={NotFoundPage} />
                </Router>
                <div class="sync-state">{syncText}</div>
            </ErrorBoundary>
        </LocationProvider>
    );
}
