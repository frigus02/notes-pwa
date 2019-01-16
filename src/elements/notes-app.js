import NotesBaseElement, {
    html,
    dynamicElement,
    until
} from "./notes-base-element.js";
import { cssColors } from "./utils/colors.js";
import router from "./utils/router.js";

class NotesApp extends NotesBaseElement {
    static get is() {
        return "notes-app";
    }

    static get properties() {
        return {
            dataPage: String,
            dataPageParams: Object
        };
    }

    constructor() {
        super();
        this._onRouteChange = this._onRouteChange.bind(this);
    }

    connectedCallback() {
        this.dataPage = router.route;
        this.dataPageParams = router.params;
        router.addEventListener("change", this._onRouteChange);
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        router.removeEventListener("change", this._onRouteChange);
    }

    _onRouteChange(e) {
        this.dataPage = e.detail.route;
        this.dataPageParams = e.detail.params;
    }

    render({ dataPage, dataPageParams }) {
        const page = import(`./notes-page-${dataPage}.js`).then(() =>
            dynamicElement(`notes-page-${dataPage}`, {
                dataState: Object.assign({}, dataPageParams)
            })
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

customElements.define(NotesApp.is, NotesApp);
