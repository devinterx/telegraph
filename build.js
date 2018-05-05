const webpack = require('webpack');
const config = require('./webpack.config');
const compiler = webpack(config);

compiler.run((error, stats) => {
    if (error) throw error;

    stats.stats.forEach(stats => {
        process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }) + '\n\n');
    });
});
