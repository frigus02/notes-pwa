const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

class ServiceWorkerPlugin {
    constructor(options) {
        this.options = options;
        this.assets = new Set();
    }

    async _generateServiceWorker(file, newAssets) {
        Object.keys(newAssets).forEach(asset => this.assets.add(asset));

        const source = await readFile(file, { encoding: 'utf8' });
        const cacheName = `const CACHE_NAME = ${JSON.stringify(Date.now().toString())};`;
        const cacheUrls = `const CACHE_URLS = ${JSON.stringify([...this.assets])};`;
        return `${cacheName}\n${cacheUrls}\n${source}`;
    }

    apply(compiler) {
        const resolvedFile = path.resolve(compiler.context, this.options.filename);

        compiler.hooks.emit.tapPromise('ServiceWorkerPlugin', async compilation => {
            const source = this.options.disableServiceWorker
                ? `console.log('Service worker is disabled.')`
                : await this._generateServiceWorker(resolvedFile, compilation.assets);

            compilation.assets[this.options.filename] = {
                source: () => source,
                size: () => Buffer.byteLength(source, 'utf8'),
            };
        });

        compiler.hooks.afterEmit.tap('ServiceWorkerPlugin', compilation => {
            compilation.fileDependencies.add(resolvedFile);
        });
    }
}

module.exports = ServiceWorkerPlugin;
