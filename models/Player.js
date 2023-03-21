const { Schema, model } = require( 'mongoose' );
const { v4: uuidv4 } = require( 'uuid' );

const playerSchema = new Schema( {
  playerIDd: { type: String, default: uuidv4 },
  firstname: String,
  lastname: String,
  teamID: { type: String, default: '' },
  lives: { type: Number, default: 10 },
} );

const Player = model( 'Player', playerSchema );
module.exports = Player;
