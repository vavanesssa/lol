const config = require('config')

module.exports = function (logger) {
  if (config.get('log.disable')) {
    return
  } else {
    return console.log(logger)
  }
}
