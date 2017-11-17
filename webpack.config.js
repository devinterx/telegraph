const webpack = require('webpack');
const path = require('path');

module.exports = {
    cache: false,
    devtool: 'source-map',
    target: 'node',
    entry: [
        './src/game.js'
    ],
    output: {
        path: path.resolve('./build/'),
        publicPath: '',
        filename: './game.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|es6)$/i,
                exclude: [/node_modules/],
                use: [
                    'source-map-loader',
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['es2015'],
                            plugins: ['transform-runtime', ['transform-class-properties', {spec: true}]],
                            cacheDirectory: true
                        }
                    }],
                enforce: 'pre'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.es6'],
        modules: ['node_modules']
    },
    plugins: [
        // new webpack.DefinePlugin({
        //     'process.env': {
        //         'NODE_ENV': JSON.stringify('production'),
        //         'NTBA_FIX_319': true,
        //         'BOT_TOKEN': ''
        //     }
        // })
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     },
        //     output: {
        //         comments: false
        //     },
        //     sourceMap: true
        // })
    ]
}
;
