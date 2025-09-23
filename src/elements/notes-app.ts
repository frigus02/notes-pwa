import { shortDate } from "../shared/format.js";
import { render, html, dynamicElement, until } from "./notes-base-element.js";
import { cssColors } from "./utils/colors.js";
import router, { type Params } from "./utils/router.js";
import { sync } from "./utils/worker.js";

function getSyncText() {
    if (sync.state === "syncing") {
        return "syncing...";
    } else if (!sync.lastResult) {
        return "not synced";
    } else if (sync.lastResult.type === "success") {
        return `synced at ${shortDate(sync.lastResult.date)}`;
    } else {
        return `sync failed at ${shortDate(sync.lastResult.date)}: ${sync.lastResult.error.message}`;
    }
}

class NotesApp extends HTMLElement {
    dataPage: string;
    dataPageParams: Params;
    dataSyncState: string;

    constructor() {
        super();
        this.dataPage = "";
        this.dataPageParams = {};
        this.dataSyncState = getSyncText();
        this._onRouteChange = this._onRouteChange.bind(this);
        this._onSyncChange = this._onSyncChange.bind(this);
    }

    connectedCallback() {
        if (!this.shadowRoot) {
            this.attachShadow({ mode: "open" });
        }

        this.dataPage = router.route;
        this.dataPageParams = router.params;
        this.renderToDOM();
        router.addEventListener("change", this._onRouteChange);
        sync.addEventListener("sync-start", this._onSyncChange);
        sync.addEventListener("sync-end", this._onSyncChange);
        sync.all();
    }

    disconnectedCallback() {
        router.removeEventListener("change", this._onRouteChange);
    }

    _onRouteChange(e: Event) {
        this.dataPage = (e as CustomEvent).detail.route;
        this.dataPageParams = (e as CustomEvent).detail.params;
        this.renderToDOM();
    }

    _onSyncChange() {
        this.dataSyncState = getSyncText();
        this.renderToDOM();
    }

    renderToDOM() {
        const result = this.render({
            dataPage: this.dataPage,
            dataPageParams: this.dataPageParams,
            dataSyncState: this.dataSyncState,
        });
        if (result) {
            render(result, this.shadowRoot!);
        }
    }

    render({
        dataPage,
        dataPageParams,
        dataSyncState,
    }: {
        dataPage: string;
        dataPageParams: Params;
        dataSyncState: string;
    }) {
        const page = import(`./notes-page-${dataPage}.ts`).then(() =>
            dynamicElement(`notes-page-${dataPage}`, {
                dataState: Object.assign({}, dataPageParams),
            }),
        );

        return html`
            ${cssColors}
            <style>
                :host {
                    display: block;
                }

                .sync-state {
                    position: fixed;
                    right: 0;
                    bottom: 0;
                }
            </style>

            ${until(page, "Loading...")}
            <div class="sync-state">${dataSyncState}</div>
        `;
    }
}

customElements.define("notes-app", NotesApp);
