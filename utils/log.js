const config = require( 'config' )

function getFormattedDateTimeInFrench () {
  const options = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  const formatter = new Intl.DateTimeFormat( 'fr-FR', options );
  const dateTime = formatter.format( new Date() );
  return dateTime;
}

module.exports = function ( message ) {
  if ( config.get( 'log.disable' ) ) {
    return
  } else {
    return console.log( `[${getFormattedDateTimeInFrench()}] ${message}` )
  }
}
