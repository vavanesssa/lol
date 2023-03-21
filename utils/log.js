const config = require('config')

function getFormattedDateTimeInFrench () {
  return new Intl.DateTimeFormat( 'fr-FR', {
    dateStyle: 'full',
    timeStyle: 'medium',
  } ).format( new Date() );
}

module.exports = function ( message ) {
  if (config.get('log.disable')) {
    return
  } else {
    return console.log( `[${getFormattedDateTimeInFrench()}] ${message}` )
  }
}
