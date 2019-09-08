var SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')

module.exports = {
  runtimeCompiler: true,
    lintOnSave: false,
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
        // GraphQL Loader
        config.module
            .rule('worker')
            .test(/\.worker\.js$/)
            .use('worker-loader')
            .loader('worker-loader')
            .end()
  }
}
