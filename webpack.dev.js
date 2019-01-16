'use strict';

const merge = require('webpack-merge');

const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devServer: {
        compress: true,
        historyApiFallback: true,
        host: '0.0.0.0',
        //https: true,
        port: 8080
    },
    devtool: 'eval-source-map'
});
