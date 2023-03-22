const express = require( 'express' )
const mongoose = require( 'mongoose' )
const cors = require( 'cors' )
const { Server } = require( 'socket.io' )
const logger = require( './utils/log.js' )
const app = express()
const uuidv4 = require( 'uuid' ).v4;
const path = require( 'path' );
const PORT = process.env.PORT || 3001

// MongoDB connection
const MONGODB_URI =
  'mongodb+srv://lol:lol@cluster0.e7mbqki.mongodb.net/?retryWrites=true&w=majority'
mongoose.set( 'strictQuery', false )
mongoose
  .connect( MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } )
  .then( () => logger( 'MongoDB connected' ) )
  .catch( ( err ) => logger( err ) )

const playerSchema = new mongoose.Schema( {
  firstname: String,
  lastname: String,
  id: String,
  teamID: String,
  lives: { type: Number, default: 10 },
} )

const gameSettingsSchema = new mongoose.Schema( {
  maximumLives: { type: Number, default: 10 },
} );

const GameSettings = mongoose.model( "GameSettings", gameSettingsSchema );
const Player = mongoose.model( 'Player', playerSchema )

// App Middlewares
app.use( cors() )
app.use( express.json() )

app.use( express.static( path.join( __dirname, 'front', 'dist' ) ) );

const server = app.listen( PORT, () => {
  logger( `Server running on port ${PORT}` )
} )

//Socket Init
const io = new Server( server, {
  cors: {
    origin: '*',
  },
} )

io.on( 'connection', ( socket ) => {
  logger( 'Client connected' )
  socket.on( 'disconnect', () => {
    logger( 'Client disconnected' )
  } )
} )

// API
app.get( '/api/getplayers', async ( req, res ) => {
  try {
    const players = await Player.find();
    res.json( players );
    logger( ` GET / getplayers - Retrieved ${players.length} players ` );
  } catch ( err ) {
    logger( `Error: ${err} ` );
    res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

app.get( '/api/getplayers/:playerid', async ( req, res ) => {
  logger( `GET /getplayers/${req.params.playerid}` );
  try {
    const player = await Player.findOne( {
      id: req.params.playerid,
    } );
    res.json( player );
  } catch ( err ) {
    logger( err );
    res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

app.post( '/api/addplayer', async ( req, res ) => {
  const { firstname, lastname, lives } = req.body;
  try {
    const id = uuidv4();
    const newPlayer = new Player( { firstname, lastname, id, teamID: '', lives: lives } );
    await newPlayer.save();
    io.emit( 'playerAdded', newPlayer );
    res.json( newPlayer );
    logger( `POST /addplayer - Added player: ${firstname} ${lastname}` );
  } catch ( err ) {
    logger( `Error: ${err}` );
    res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

app.post( '/api/editplayer', async ( req, res ) => {
  const { id, firstname, lastname } = req.body;
  try {
    const player = await Player.findOneAndUpdate(
      { id },
      { firstname, lastname },
      { new: true }
    );
    io.emit( 'playerUpdated', player );
    res.json( player );
    logger( `POST /editplayer - Updated player: ${firstname} ${lastname}` );
  } catch ( err ) {
    logger( `Error: ${err}` );
    res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

app.post( '/api/removeplayer', async ( req, res ) => {
  const { id } = req.body;
  try {
    const player = await Player.findOneAndDelete( { id } );
    io.emit( 'playerRemoved', id );
    res.json( player );
    logger( `POST /removeplayer - Removed player: ${player.firstname} ${player.lastname}` );
  } catch ( err ) {
    logger( `Error: ${err}` );
    res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

app.post( '/api/updateteam', async ( req, res ) => {
  logger( 'POST /updateteam' );
  try {
    const { id, teamID } = req.body;
    const player = await Player.findOneAndUpdate(
      { id },
      { teamID },
      { new: true }
    );
    io.emit( 'teamUpdated', player );
    res.json( player );
  } catch ( err ) {
    logger( err );
    res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

app.post( "/api/removelive", async ( req, res ) => {
  const { id } = req.body;
  try {
    const player = await Player.findOne( { id } );
    if ( player.lives > 0 ) {
      player.lives -= 1;
      await player.save();
      io.emit( 'livesUpdated', player );
    }
    res.json( player );
    logger( `POST /removelive - Removed live from ${player.firstname} ${player.lastname}, lives left: ${player.lives}` );
  } catch ( err ) {
    logger( `Error: ${err}` );
    res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

app.post( "/api/addlive", async ( req, res ) => {
  const { id } = req.body;
  try {
    const player = await Player.findOne( { id } );
    const settings = await GameSettings.findOne();
    if ( player.lives < settings.maximumLives ) {
      player.lives += 1;
      await player.save();
      io.emit( "livesUpdated", player );
    }
    res.json( player );
    logger( `POST / addlive - Added live to ${player.firstname} ${player.lastname}, lives left: ${player.lives} ` );
  } catch ( err ) {
    logger( `Error: ${err} ` );
    res.status( 500 ).json( { error: "Internal Server Error" } );
  }
} );

app.get( "/api/getsettings", async ( req, res ) => {
  logger( "GET /getsettings" );
  try {
    let settings = await GameSettings.findOne();
    if ( !settings ) {
      settings = new GameSettings();
      await settings.save();
    }
    res.json( settings );
  } catch ( err ) {
    logger( err );
    res.status( 500 ).json( { error: "Internal Server Error" } );
  }
} );

app.post( "/api/updatesettings", async ( req, res ) => {
  const { maximumLives } = req.body;
  try {
    let settings = await GameSettings.findOne();
    if ( !settings ) {
      settings = new GameSettings();
    }
    settings.maximumLives = maximumLives;
    await settings.save();
    res.json( settings );
    io.emit( "updateSettings" );
    logger( `POST /updatesettings - maximumLives set to ${maximumLives}` );
  } catch ( err ) {
    logger( `Error: ${err}` )
    res.status( 500 ).json( { error: "Internal Server Error" } );
  }
} );

app.post( '/api/resetlives', async ( req, res ) => {
  logger( 'POST /resetlives' );
  try {
    const { maximumLives } = req.body;
    await Player.updateMany( {}, { $set: { lives: maximumLives } } );
    const players = await Player.find();
    io.emit( 'playersReset', players );
    res.json( players );
  } catch ( err ) {
    logger( err );
    res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

