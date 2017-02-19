module.exports = {
	entry: './app.js',
	watch: false,
	output: {
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.js[x]?$/,
				exclude: /node_module/,
				loader: 'babel-loader?presets[]=es2015&presets[]=react'
			},
		]
	},
	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.common.js'
		}
	}
};