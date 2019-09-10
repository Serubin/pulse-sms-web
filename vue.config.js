var SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')

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
            })
        ]
    },
    chainWebpack: config => {
        // Worker Loader
        config.module
            .rule('worker')
            .test(/\.worker\.js$/)
            .use('worker-loader')
            .loader('worker-loader')
            .end()
    }
}
