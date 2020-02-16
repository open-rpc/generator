const path = require('path');

module.exports = {
  entry: './build/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
};
