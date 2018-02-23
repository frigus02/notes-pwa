import { sync } from './worker.js';

class Sync {
    constructor() {
        this._clientId = 'mr76lz3bjoqdof3';
        this._accessToken = null;
    }

    continueSync() {
        const params = new URLSearchParams(window.location.hash.substr(1));
        if (params.has('access_token')) {
            this._accessToken = params.get('access_token');
            window.history.pushState(null, '', window.location.pathname);
            return true;
        } else if (params.has('error')) {
            console.log(`${params.get('error')}\n${params.get('error_description')}`);
            window.history.pushState(null, '', window.location.pathname);
        }
    }

    async _authenticate() {
        const url = new URL('https://www.dropbox.com/oauth2/authorize');
        url.searchParams.append('response_type', 'token');
        url.searchParams.append('client_id', this._clientId);
        url.searchParams.append('redirect_uri', `${window.location.origin}${window.location.pathname}`);
        window.location = url.toString();
        return new Promise(() => { });
    }

    async sync() {
        if (!this._accessToken) {
            await this._authenticate();
        } else {
            await sync(this._accessToken);
        }
    }
}

const instance = new Sync();

export default instance;
