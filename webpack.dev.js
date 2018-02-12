'use strict';

const merge = require('webpack-merge');

const common = require('./webpack.common.js');

module.exports = merge(common, {
    devServer: {
        compress: true,
        historyApiFallback: true,
        //host: '0.0.0.0',
        open: true,
        port: 8080
    },
    devtool: 'source-map'
});
