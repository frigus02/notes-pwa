export type Routes = Record<string, string>;
export type Params = Record<string, string>;

export class Router extends EventTarget {
    static matchRoute(template: string, path: string): Params | null {
        const templateSegments = template.split("/");
        const pathSegments = path.split("/");
        if (templateSegments.length !== pathSegments.length) {
            return null;
        }

        const params: Params = {};
        for (let i = 0; i < templateSegments.length; i++) {
            if (templateSegments[i].startsWith(":")) {
                params[templateSegments[i].substr(1)] = pathSegments[i];
            } else if (templateSegments[i] !== pathSegments[i]) {
                return null;
            }
        }

        return params;
    }

    private _routes: Routes;
    path!: string;
    route!: string;
    params!: Params;

    constructor(routes: Routes) {
        super();
        this._routes = routes;
        this._resolve();
        window.addEventListener("popstate", () => this._resolve(true));
    }

    _resolve(dispatch?: boolean) {
        if (this.path === window.location.pathname) {
            return;
        }

        this.path = window.location.pathname;
        this.route = "404";
        this.params = {};
        for (const route in this._routes) {
            const params = Router.matchRoute(this._routes[route], this.path);
            if (params) {
                this.route = route;
                this.params = params;
                break;
            }
        }

        if (dispatch) {
            this.dispatchEvent(
                new CustomEvent("change", {
                    detail: {
                        route: this.route,
                        params: this.params,
                        path: this.path,
                    },
                }),
            );
        }
    }

    navigate(path: string) {
        if (path !== this.path) {
            window.history.pushState(null, "", path);
            this._resolve(true);
        }
    }
}

const instance = new Router({
    list: "/",
    note: "/note/:noteId",
    edit: "/note/:noteId/edit",
    settings: "/settings",
});

export default instance;
