const CompressionPlugin = require("compression-webpack-plugin")
const StyleLintPlugin = require('stylelint-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require("path");

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}

const themes = [
    'theme-UL',
    'theme-Concordia'
];

var extracts = [];

var config = {
    rules: [{
            enforce: 'post',
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
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
        new CompressionPlugin(),
        new StyleLintPlugin({
            configFile: 'conf/stylelint.json',
            emitErrors: false
        })
    ]
};

themes.forEach(function (theme, i) {
    extracts.push(
        new ExtractTextPlugin('themes/' + theme + '.css')
    )

    config.plugins.push(extracts[i]);

    config.rules.push({
        enforce: 'post',
        test: new RegExp(theme + '\.scss$'),
        use: extracts[i].extract({
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
    })
});

module.exports = {
    entry: {
        app: ["./src/app/styles/themes/_theme-loader.ts"]
    },

    output: {
        path: resolve('dist'),
        publicPath: "/",
        filename: "app.js"
    },

    devtool: 'source-map',

    module: {
        rules: config.rules
    },

    plugins: config.plugins
}