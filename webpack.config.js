const webpack = require('webpack');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodeExternals = require('webpack-node-externals');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

const common = {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.(js)$/i,
                exclude: [/node_modules/],
                use: [
                    'source-map-loader',
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['es2015', 'react'],
                            plugins: [
                                'transform-runtime',
                                ['transform-class-properties', {spec: true}],
                                ['transform-builtin-extend', {globals: ['Error', 'Array']}]
                            ],
                            cacheDirectory: true
                        }
                    }
                ],
                enforce: 'pre'
            },
            {
                test: /\.(es6|jsx)$/i,
                exclude: [/node_modules/],
                use: [
                    'source-map-loader',
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['es2015', 'react'],
                            plugins: [
                                'transform-runtime',
                                ['transform-class-properties', {spec: true}],
                                ['transform-builtin-extend', {globals: ['Error', 'Array']}]
                            ],
                            cacheDirectory: true
                        }
                    }
                ],
                enforce: 'pre'
            },
            {
                test: /\.css$/i,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'source-map-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                publicPath: ''
                            }
                        }]
                })
            },
            {
                test: /\.html$/i,
                use: [{
                    loader: 'html-loader'
                }]
            },
        ]
    }
};

const backend = {
    cache: false,
    devtool: 'source-map',
    target: 'node',
    entry: [
        './src/backend.js'
    ],
    output: {
        path: path.resolve('./build/'),
        publicPath: '',
        filename: './server.js'
    },
    externals: [
        NodeExternals({whitelist: ['babel-runtime', 'cookie-parser']})
    ],
    resolve: {
        extensions: ['.js', '.es6', '.jsx'],
        modules: ['node_modules']
    },
    optimization: {
        minimize: true,
        splitChunks: {
            chunks: "async",
            minSize: 1000,
            minChunks: 2,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            name: false,
            cacheGroups: {
                default: {
                    minChunks: 1,
                    priority: -20,
                    reuseExistingChunk: true,
                },
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true
                }
            }
        },
        minimizer: [
            new UglifyJsPlugin({
                extractComments: false,
                sourceMap: true,
                uglifyOptions: {
                    mangle: {
                        keep_fnames: true,
                    },
                },
            }),
        ],
    },
    plugins: [
        new ProgressPlugin((percentage, msg, current, active, modulePath) => {
            if (process.stdout.isTTY && percentage < 1) {
                process.stdout.cursorTo(0);
                modulePath = modulePath ? ' …' + modulePath.substr(modulePath.length - 30) : '';
                current = current ? ' ' + current : '';
                active = active ? ' ' + active : '';
                process.stdout.write((percentage * 100).toFixed(0) + '% ' + msg + current + active + modulePath + ' ');
                process.stdout.clearLine(1)
            } else if (percentage === 1) {
                console.log('Webpack: backend compile done.')
            }
        }),
        new webpack.NoEmitOnErrorsPlugin(),
        new CopyWebpackPlugin([
            {from: 'src/config.json'},
            {from: './package.json'}
        ])
    ]
};

const frontend = {
    cache: false,
    devtool: 'source-map',
    entry: [
        './src/frontend.jsx'
    ],
    output: {
        path: path.resolve('./build/public'),
        publicPath: '',
        filename: './application.js'
    },
    resolve: {
        extensions: ['.js', '.es6', '.jsx'],
        modules: ['node_modules'],
        alias: {}
    },
    optimization: {
        minimize: true,
        splitChunks: {
            chunks: "async",
            minSize: 1000,
            minChunks: 2,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            name: true,
            cacheGroups: {
                default: {
                    minChunks: 1,
                    priority: -20,
                    reuseExistingChunk: true,
                },
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true
                }
            }
        },
        minimizer: [
            new UglifyJsPlugin({
                extractComments: false,
                sourceMap: true,
                uglifyOptions: {
                    mangle: {
                        keep_fnames: true,
                    },
                },
            }),
        ],
    },
    plugins: [
        new ProgressPlugin((percentage, msg, current, active, modulePath) => {
            if (process.stdout.isTTY && percentage < 1) {
                process.stdout.cursorTo(0);
                modulePath = modulePath ? ' …' + modulePath.substr(modulePath.length - 30) : '';
                current = current ? ' ' + current : '';
                active = active ? ' ' + active : '';
                process.stdout.write((percentage * 100).toFixed(0) + '% ' + msg + current + active + modulePath + ' ');
                process.stdout.clearLine(1)
            } else if (percentage === 1) {
                console.log('Webpack: frontend compile done.')
            }
        }),
        new ExtractTextPlugin({
            filename: './application.css',
            allChunks: true
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html',
            minify: {
                removeComments: true,
                collapseWhitespace: true
            },
            inject: true,
            hash: true
        }),
        new CopyWebpackPlugin([
            {from: 'src/favicon.ico'},
        ])
    ]
};

module.exports = [
    Object.assign({}, common, frontend),
    Object.assign({}, common, backend)
];
