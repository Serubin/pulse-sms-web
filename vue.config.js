const webpack = require('webpack');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

module.exports = {
    devServer: {
        port: 8081
    },
    runtimeCompiler: true,
    lintOnSave: true,
    configureWebpack: {
        plugins: [
            new SWPrecacheWebpackPlugin({
                cacheId: 'pulse-sms',
                filename: 'service-worker.js',
                staticFileGlobs: ['dist/**/*.{js,css}', '/'],
                minify: true,
                stripPrefix: 'dist/',
                dontCacheBustUrlsMatching: /\.\w{6}\./
            }),
            new webpack.BannerPlugin('PulseSMS Web - Copyright 2018 Solomon Rubin & Luke Klinker - Licensed under MIT and Apache 2.0 - this notice cannot be removed - admin@serubin.net')
        ]
    }
    // chainWebpack: config => {}
};
