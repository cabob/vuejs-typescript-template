const HtmlWebpackPlugin = require('html-webpack-plugin')
const CompressionPlugin = require("compression-webpack-plugin")
const StyleLintPlugin = require('stylelint-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require('webpack')
const path = require("path")

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

const config = {
    rules: [{
            enforce: 'post',
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },
        {
            enforce: 'post',
            test: /\.scss$/,
            exclude: /themes/,
            use: ['style-loader',
                'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: function () {
                            return [
                                require('autoprefixer')
                            ];
                        }
                    }
                },
                'sass-loader'
            ]
        },
        {
            enforce: 'post',
            test: /\.scss$/,
            include: /themes/,
            exclude: /dev-theme\.scss$/,
            loader: "file-loader?name=./themes/[name].css!sass-loader"
        },
        {
            test: /\.html$/,
            loader: 'vue-template-loader',
            exclude: resolve('src/index.html'),
            options: {
                scoped: true
            }
        },
        {
            test: /\.ts$/,
            loader: 'awesome-typescript-loader',
            options: {
                configFileName: resolve('tsconfig.json')
            }
        },
        {
            test: /\.ts$/,
            enforce: 'pre',
            loader: 'tslint-loader',
            include: [resolve('src'), resolve('tests')],
            options: {
                configFile: 'conf/tslint.json',
                formatter: 'grouped',
                formattersDirectory: 'node_modules/custom-tslint-formatters/formatters'
            }
        }
    ],
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: resolve('src/index.html'),
            inject: 'body'
        }),
        new StyleLintPlugin({
            configFile: 'conf/stylelint.json',
            emitErrors: false
        }),
        new CompressionPlugin()
    ]
}

module.exports = function (env) {
    if (env && env.build) {
        config.plugins.push(new webpack.IgnorePlugin(/dev-theme\.scss$/));
    } else {
        config.rules.push({
            enforce: 'post',
            test: /dev-theme\.scss$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: ['css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function () {
                                return [
                                    require('autoprefixer')
                                ];
                            }
                        }
                    },
                    'sass-loader'
                ]
            })
        });
        config.plugins.push(new ExtractTextPlugin("theme.css"));
    }

    return {
        entry: {
            app: [
                "./src/app/main.ts",
                "./src/app/styles/themes/_theme-loader.ts"
            ]
        },

        output: {
            path: resolve('dist'),
            publicPath: "/",
            filename: "app.js"
        },

        resolve: {
            extensions: ['.js', '.ts', '.html'],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                "@": resolve('src')
            }
        },

        devtool: 'source-map',

        module: {
            rules: config.rules
        },
        plugins: config.plugins
    }
}