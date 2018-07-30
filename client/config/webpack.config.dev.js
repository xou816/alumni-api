const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const RelayCompilerWebpackPlugin = require('relay-compiler-webpack-plugin');

process.env.NODE_ENV = 'development';

module.exports = {
	mode: 'development',
	entry: path.resolve(__dirname, '../src/index.jsx'),
	devServer: {
		contentBase: path.resolve(__dirname, '../../dist/public'),
		watchContentBase: true,
		proxy: {
			'/api': 'http://localhost:3000/graphql'
		}
	},
	output: {
		filename: 'compiled.js',
		path: path.resolve(__dirname, '../../dist/public'),
		publicPath: '/'
	},
	module: {
		rules: [
		{
			test: /\.(js|jsx)$/,
			include: path.resolve(__dirname, '../src'),
			exclude: /node_modules/,
			loaders: 'babel-loader'
		},
		]
	},
	plugins: [
	new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('development')}),
	new HtmlWebpackPlugin({
		template: path.resolve(__dirname, '../src/index.html')
	}),
	new webpack.HotModuleReplacementPlugin(),
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