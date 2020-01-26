const  path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

const isDev = process.env.NODE_ENV === 'development'
const isStats = process.env.NODE_ENV === 'stats'
const isProd = !isDev

const optimization = () => {
    const config = {
        splitChunks: { // оптимизирует приложени, удаляет повторяющиеся библиоткеи из чанков
            chunks: "all"
        }
    }

    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetPlugin(),
            new TerserWebpackPlugin()
        ]
    }
    return config

}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoaders = extra => {
    const  loaders = [{
        loader:MiniCssExtractPlugin.loader, //MiniCssExtractPlugin для того что бы заработал плагин
        options: {
            hmr: isDev,
            reloadAll: true
        }
    },
        'css-loader'
    ]

    if (extra) {
        loaders.push(extra)
    }

    return loaders
}

const jsLoaders = () => {
    const loaders = [{
        loader: 'babel-loader',
        options: {
            presets: [
                '@babel/preset-env',
            ],
            plugins: [
                '@babel/plugin-proposal-class-properties'
            ]
        }
    }]

    if(isDev) {
        loaders.push('eslint-loader')
    }

    return loaders
}

const plugins = () => {
    const base = [
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(), // чистит папку с продом от других версий фалов
        new CopyWebpackPlugin([ //copy-webpack-plugin плагин коприрования контента
            {
                from: path.resolve(__dirname, 'src/favicon.ico'),
                to: path.resolve(__dirname, 'dist')
            }
        ]),
        new MiniCssExtractPlugin({ // для работы с css
            filename: filename('css') //указать формирование имини файла
        })
    ]

    if(isStats) {
        base.push(new BundleAnalyzerPlugin())
    }
    return base
}

module.exports = {
    context: path.resolve(__dirname, 'src'), //корневая папка
    mode: 'development',
    //точка входа в приложение
    entry: {
        main: ['@babel/polyfill','./index.js'],
        analytics: './analytics.ts'
    },
    //куда складывать результат
    output: {
        filename:filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js', '.json', '.svg'], // сам подставляет разрешения для файлов, по умолчанию .js
        alias: {    // алиасы для путей
            '@models' : path.resolve(__dirname, 'src/models'),
            '@' : path.resolve(__dirname, 'src/src')
        }
    },
    optimization: optimization(),
    devServer: { // webpack-dev-server - сервер
      port: 4200,
        hot: isDev
    },
    devtool: isDev ? 'source-map' : '',
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.less$/,
                use: cssLoaders('less-loader')
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(png|jpg|svg)$/,
                use: ['file-loader']
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                use: ['file-loader']
            },
            {
                test: /\.js$/,
                exclude: /node_modules/, // убрать папку из поиска
                use: jsLoaders()

            },
            {
                test: /\.ts$/,
                exclude: /node_modules/, // убрать папку из поиска
                loader: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-typescript'
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties'
                        ]
                    }
                }
            }
        ]
    }
}