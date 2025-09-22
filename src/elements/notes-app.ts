import { render, html, dynamicElement, until } from "./notes-base-element.js";
import { cssColors } from "./utils/colors.js";
import router, { type Params } from "./utils/router.js";

class NotesApp extends HTMLElement {
    dataPage: string;
    dataPageParams: Params;

    constructor() {
        super();
        this.dataPage = "";
        this.dataPageParams = {};
        this._onRouteChange = this._onRouteChange.bind(this);
    }

    connectedCallback() {
        if (!this.shadowRoot) {
            this.attachShadow({ mode: "open" });
        }

        this.dataPage = router.route;
        this.dataPageParams = router.params;
        this.renderToDOM();
        router.addEventListener("change", this._onRouteChange);
    }

    disconnectedCallback() {
        router.removeEventListener("change", this._onRouteChange);
    }

    _onRouteChange(e: Event) {
        this.dataPage = (e as CustomEvent).detail.route;
        this.dataPageParams = (e as CustomEvent).detail.params;
        this.renderToDOM();
    }

    renderToDOM() {
        const result = this.render({
            dataPage: this.dataPage,
            dataPageParams: this.dataPageParams,
        });
        if (result) {
            render(result, this.shadowRoot!);
        }
    }

    render({
        dataPage,
        dataPageParams,
    }: {
        dataPage: string;
        dataPageParams: Params;
    }) {
        const page = import(`./notes-page-${dataPage}.js`).then(() =>
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
            </style>

            ${until(page, "Loading...")}
        `;
    }
}

customElements.define("notes-app", NotesApp);
