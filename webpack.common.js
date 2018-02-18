'use strict';

const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ServiceWorkerPlugin = require('./build/service-worker-plugin');

module.exports = {
    context: path.join(__dirname, 'src'),
    entry: [
        './elements/index.js',
        './elements/notes-toolbar.js'
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.ejs',
            inject: false
        }),
        new CopyWebpackPlugin([
            {
                from: '../node_modules/@webcomponents/webcomponentsjs/webcomponents-*.js',
                to: 'node_modules/'
            },
            {
                from: 'images/*.png'
            },
            {
                from: 'manifest.webmanifest'
            }
        ]),
        new ServiceWorkerPlugin({
            filename: 'sw.js'
        })
    ]
};
