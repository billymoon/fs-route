// if node version is less than 8 use async-to-gen to support async/await
if (process.version.slice(1).split('.')[0] < 8) {
  require('async-to-gen/register')
}

// support es6 modules
require('@std/esm')

// bootstrap the server
module.exports = require('./bootstrap')
