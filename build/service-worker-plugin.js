const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

class ServiceWorkerPlugin {
    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        const filename = path.resolve(compiler.context, this.options.filename);
        const assets = new Set();

        compiler.plugin('emit', async (compilation, callback) => {
            try {
                Object.keys(compilation.assets).forEach(asset => assets.add(asset));

                const swSource = await readFile(filename, { encoding: 'utf8' });
                const cacheName = `const CACHE_NAME = ${JSON.stringify(Date.now().toString())};`;
                const cacheUrls = `const CACHE_URLS = ${JSON.stringify([...assets])};`;
                const swGenerated = `${cacheName}\n${cacheUrls}\n${swSource}`;

                compilation.assets[this.options.filename] = {
                    source: () => swGenerated,
                    size: () => Buffer.byteLength(swGenerated, 'utf8'),
                };

                callback();
            } catch (e) {
                callback(e);
            }
        });

        compiler.plugin('after-emit', (compilation, callback) => {
            compilation.fileDependencies.push(filename);
            callback();
        });
    }
}

module.exports = ServiceWorkerPlugin;
