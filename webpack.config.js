const webpack = require('webpack');
const path = require('path');
const RemovePlugin = require('remove-files-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const buildPath = path.resolve(__dirname, 'build');

const server = {
    entry: ['./src/server/main.ts'],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['ts-loader'],
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({ 'global.GENTLY': false }),
        new RemovePlugin({
            before: {
                include: [
                    path.resolve(buildPath, 'server')
                ]
            },
            watch: {
                include: [
                    path.resolve(buildPath, 'server')
                ]
            }
        }),
        new ESLintPlugin({
            extensions: ['prettier']
        })
    ],
    optimization: {
        minimize: true,
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[contenthash].server.js',
        path: path.resolve(buildPath, 'server')
    },
    target: 'node',
};

const client = {
    entry: ['./src/client/main.ts', './src/client/camera.ts', './src/client/util.ts', './src/client/spotlight.ts'],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['ts-loader'],
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new RemovePlugin({
            before: {
                include: [
                    path.resolve(buildPath, 'client')
                ]
            },
            watch: {
                include: [
                    path.resolve(buildPath, 'client')
                ]
            }
        }),
        new ESLintPlugin({
            extensions: ['prettier']
        })
    ],
    optimization: {
        minimize: true,
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[contenthash].client.js',
        path: path.resolve(buildPath, 'client'),
    },
};

module.exports = [server, client];