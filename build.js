const webpack = require('webpack');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const config = require('./webpack.config');
const compiler = webpack(config);

compiler.apply(new ProgressPlugin((percentage, msg, current, active, modulePath) => {
    if (process.stdout.isTTY && percentage < 1) {
        process.stdout.cursorTo(0);
        modulePath = modulePath ? ' …' + modulePath.substr(modulePath.length - 30) : '';
        current = current ? ' ' + current : '';
        active = active ? ' ' + active : '';
        process.stdout.write((percentage * 100).toFixed(0) + '% ' + msg + current + active + modulePath + ' ');
        process.stdout.clearLine(1)
    } else if (percentage === 1) {
        process.stdout.write('\n');
        console.log('webpack: done.')
    }
}));

compiler.run((error, stats) => {
    if (error) throw error;
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }) + '\n\n')
});
