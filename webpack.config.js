const path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        path: __dirname,
        filename: './dist.js',
    },
    mode: 'development',
};
