'use strict';

const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

const common = require('./webpack.common.js');

module.exports = merge(common, {
    output: {
        filename: 'bundle-[hash].js'
    },
    plugins: [
        new UglifyJsPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ]
});
