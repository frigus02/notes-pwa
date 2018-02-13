import Navigo from 'navigo/lib/navigo.es.js';

class Router extends EventTarget {
    constructor() {
        super();
        const handler = route => params => {
            this.route = route;
            this.params = params;
            this.path = this._router.generate(route, params)
            this.dispatchEvent(new CustomEvent('change', {
                detail: {
                    route,
                    params,
                    path: this.path
                }
            }));
        };

        this._router = new Navigo('http://localhost:8080', false, '#!');
        this._router.on({
            '/': handler('list'),
            '/note/:noteId': handler('note')
        });
        this._router.notFound(handler('404'));
        this._router.resolve();
    }

    navigate(path) {
        this._router.navigate(path);
    }
}

const instance = new Router();
export default instance;
