const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
let LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin");
const ENV_CONFIG = require("./src/config/environment")

const webpack = require('webpack');

let parentDir = path.join(__dirname, './src/');

const plugins = [];
let config = {};

if(process.env.DEBUG){
    plugins.push(new BundleAnalyzerPlugin());
}
module.exports = (env, argv) => {
    if(process.env.NODE_ENV !== 'production'){
        //console.log("adding source map")
        config.devtool = 'source-map';
    }
    return {
        ...config,
        entry: {
            index: [path.join(parentDir, 'app.js')],
        },
        stats: {children: false},
        resolve: {
            alias: {
                '@apiService': path.resolve(__dirname, 'src/services/apiService.js'),
                '@config': path.resolve(__dirname, 'src/config'),
                '@utils': path.resolve(__dirname, 'src/utils'),
                '@components': path.resolve(__dirname, 'src/components'),
                '@common': path.resolve(__dirname, 'src/common'),
                '@assets': path.resolve(__dirname, 'src/assets/'),
                '@styles': path.resolve(__dirname, 'src/styles/'),
                '@containers': path.resolve(__dirname, 'src/containers/'),
                '@routeConstants': path.resolve(__dirname, 'src/utils/constants/routeConstants.js'),
                '@constants': path.resolve(__dirname, 'src/utils/constants'),
                '@src': path.resolve(__dirname, 'src'),
                '@environment': path.resolve(__dirname, 'src/config/environment'),
                '@services': path.resolve(__dirname, 'src/services/api'),
            },
        },
        plugins: [
            ...plugins,
            new CompressionPlugin({
                filename: "[path][base].gz",
            }),
            new CleanWebpackPlugin(),
            new LodashModuleReplacementPlugin({
                paths: true,
            }),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, './src/index.html'),
                filename: 'index.html',
                fbId: ENV_CONFIG.FB_ID,
                appsflyerWebId: ENV_CONFIG.APPSFLYER_WEB_ID,
                googleConversionKey: ENV_CONFIG.GOOGLE_CONVERSION.KEY,
                gtmId: ENV_CONFIG.GTM_ID
            }),
            new CopyWebpackPlugin([
                {from: './src/assets/fonts', to: 'assets/fonts'},
                {from: './src/assets/images', to: 'assets/images'},

                {from: './src/assets/erosPlayer', to: 'assets/erosPlayer'},
                {from: './src/assets/hungamaPlayer', to: 'assets/hungamaPlayer'},
                {from: './src/.well-known/assetlinks.json', to: '.well-known/assetlinks.json'},
                {from: './src/serverFiles/eula.html', to: 'eula.html'},
                {from: './src/serverFiles/eula.css', to: 'eula.css'},
                {from: './src/serverFiles/eula-hybrid.html', to: 'eula-hybrid.html'},
                {from: './src/serverFiles/privacy-policy.html', to: 'privacy-policy.html'},
                {from: './src/serverFiles/privacy-policy.css', to: 'privacy-policy.css'},
                {from: './src/serverFiles/privacy-policy-hybrid.html', to: 'privacy-policy-hybrid.html'},
                {from: './src/serverFiles/termsConditions.html', to: 'termsConditions.html'},
                {from: './src/serverFiles/termsConditions.css', to: 'termsConditions.css'},
                {from: './src/serverFiles/termsConditions-hybrid.html', to: 'termsConditions-hybrid.html'},
                {from: './src/serverFiles/primeTermsConditions.css', to: 'primeTermsConditions.css'},
                {from: './src/serverFiles/primeTermsConditions.html', to: 'primeTermsConditions.html'},
                {from: './src/serverFiles/termsConditionsV1.html', to: 'termsConditionsV1.html'},
                {from: './src/serverFiles/termsConditionsV2.html', to: 'termsConditionsV2.html'},
                {from: './src/serverFiles/termsConditionsV3.html', to: 'termsConditionsV3.html'},
                {from: './src/serverFiles/termsConditionsV4.html', to: 'termsConditionsV4.html'},
                {from: './src/serverFiles/termsConditionsV5.html', to: 'termsConditionsV5.html'},
                {from: './src/serverFiles/termsConditionsV6.html', to: 'termsConditionsV6.html'},
                {from: './src/serverFiles/termsConditionsV7.html', to: 'termsConditionsV7.html'},
                {from: './src/serverFiles/notFoundPage.html', to: 'notFoundPage.html'},
                {from: './src/serverFiles/notFoundPage.css', to: 'notFoundPage.css'},
              { from: "./src/logo_hplay.png", to: "logo_hplay.png" },
            ]),
            new MiniCssExtractPlugin({
                filename: '[name].[Dec].css'
                // chunkFilename: '[id].css',
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                    'DEBUG': !!process.env.DEBUG,
                },
            }),
        ],
        devServer: {
            host: '0.0.0.0',
            port: process.env.PORT || 3000,
            contentBase: parentDir,
            disableHostCheck: true,
            historyApiFallback: true,
        },
        output: {
            path: path.join(__dirname, './dist'),
            filename: '[name].[contenthash].js',
            sourceMapFilename: '[file].map',
            publicPath: '/',
        },
        performance: { hints: false },
        optimization: {
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    styles: {
                        name: 'styles',
                        test: /\.s?css$/,
                        chunks: 'all',
                        minChunks: 1,
                        reuseExistingChunk: true,
                        enforce: true,
                    },
                    js: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "common",
                        chunks: "all",
                        minChunks: 1,
                        // maxSize: 233000,
                        reuseExistingChunk: true,
                        enforce: true,
                    },
                },
            },
        },
        module: {
            rules: [
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader',
                        {
                            loader: 'sass-resources-loader',
                            options: {
                                resources: './src/styles/styleguide.scss',
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|svg|jpg|gif|ttf|eot|ico|woff)$/,
                    use: [
                        'file-loader',
                    ],
                
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    resolve: {
                        extensions: [".js", ".jsx"],
                    },
                    use: {
                        loader: "babel-loader",
                        options: {
                            plugins: ['lodash'],
                            presets: ['@babel/react', '@babel/preset-env', {
                                plugins: [
                                    '@babel/plugin-proposal-class-properties',
                                    '@babel/transform-runtime'
                                ],
                            }],
                        },
                    },
    
                },
                // {
                //     test: /\.js$/,
                //     exclude: /node_modules/,
                //     use: ['eslint-loader'],
                // },
    
            ],
        },
    }
}
