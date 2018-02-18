import { sync } from './worker.js';

function loadAccessToken() {
    return localStorage.getItem('dbx-access-token');
}

function saveAccessToken(accessToken) {
    localStorage.setItem('dbx-access-token', accessToken);
}

class Sync {
    constructor() {
        this._clientId = 'mr76lz3bjoqdof3';
        this._accessToken = loadAccessToken();
    }

    isAuthenticated() {
        return !!this._accessToken;
    }

    async authenticate() {
        const params = new URLSearchParams(window.location.hash.substr(1));
        if (params.has('access_token')) {
            this._accessToken = params.get('access_token');
            saveAccessToken(this._accessToken);
            window.history.replaceState(null, '', window.location.pathname);
        } else {
            const url = new URL('https://www.dropbox.com/oauth2/authorize');
            url.searchParams.append('response_type', 'token');
            url.searchParams.append('client_id', this._clientId);
            url.searchParams.append('redirect_uri', 'http://localhost:8080');
            window.location = url.toString();
            return new Promise(() => { });
        }
    }

    async sync() {
        await sync(this._clientId, this._accessToken);
    }
}

const instance = new Sync();

export default instance;