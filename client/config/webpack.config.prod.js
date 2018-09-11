const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const RelayCompilerWebpackPlugin = require('relay-compiler-webpack-plugin');

module.exports = {
	entry: path.resolve(__dirname, '../src/index.jsx'),
	output: {
		filename: 'bundle.[chunkhash:8].js',
		path: path.resolve(__dirname, '../dist/public'),
		publicPath: '/public'
	},
	module: {
		rules: [
		{
			test: /\.(js|jsx)$/,
			include: path.resolve(__dirname, '../src'),
			exclude: /node_modules/,
			loaders: 'babel-loader'
		}
		]
	},
	plugins: [
	new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
	}),
	new HtmlWebpackPlugin({
		template: path.resolve(__dirname, '../src/index.html')
	}),
	new UglifyJsPlugin({
		uglifyOptions: {
            compress: {
                warnings: false,
                comparisons: false,
            },
            mangle: false,
            output: {
                comments: false,
                ascii_only: true,
            },
            sourceMap: true,
		}
    }),
	new RelayCompilerWebpackPlugin({
     	schema: path.resolve(__dirname, '../../schema.graphql'), // or schema.json or a GraphQLSchema instance
     	src: path.resolve(__dirname, '../src'),
     	extensions: ['js', 'jsx']
    })
	],
	resolve: {
		extensions: ['.js', '.jsx'],
	},
};
