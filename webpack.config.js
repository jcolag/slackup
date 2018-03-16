const path = require('path');
const webpack = require('webpack');

const port = process.env.PORT || '8080'; // eslint-disable-line no-process-env

const config = {
    'context': __dirname,
    'entry': [
        'babel-polyfill',
        path.resolve(__dirname, './renderer.js'),
        `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`, // eslint-disable-line max-len
    ],
    'module': {
        'loaders': [
            {
                'exclude': /node_modules/,
                'include': [
                    path.join(__dirname, 'src'),
                    path.join(__dirname, 'renderer.js'),
                ],
                'loader': 'babel-loader',
                'query': {
                    'presets': [
                        'es2015',
                        'react',
                        'react-hmre',
                    ],
                },
                'test': /\.js$/,
            },
            {
                'loader': 'style-loader!css-loader!sass-loader',
                'test': /\.scss$/,
            },
            {
                'loader': 'json-loader',
                'test': /\.json$/,
            },
        ],
    },
    'output': {
        'filename': 'renderer.bundle.js',
        'libraryTarget': 'commonjs2',
        'path': `${__dirname}/bundle`,
        'publicPath': `http://localhost:${port}/bundle/`,
    },
    'plugins': [new webpack.HotModuleReplacementPlugin()],
    'target': 'electron-renderer',
};

module.exports = config;
