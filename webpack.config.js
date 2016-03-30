var path = require('path');

module.exports = {
	cache: true,
	debug: true,
	devtool: 'source-map',
	entry: {
		merc: './src/main.js',
		zip_worker: './src/zip_worker.js'
	},
	output: {
		path: __dirname,
		filename: 'dist/[name].js'
	},
	module: {
	  loaders: [
	    {
	      test: /\.js[x]?$/,
	      exclude: /(node_modules|bower_components)/,
	      loader: 'babel?presets[]=es2015'
	    }
	  ]
	},
	resolve: {
		extensions: ['', '.js', '.jsx'],
		modulesDirectories: ["./src", "node_modules", "bower_components"]
	}
};
