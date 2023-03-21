const express = require( 'express' )
const mongoose = require( 'mongoose' )
const cors = require( 'cors' )
const { Server } = require( 'socket.io' )
const logger = require( './utils/log.js' )
const app = express()
const uuidv4 = require( 'uuid' ).v4;

const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341'
const PORT = process.env.PORT || 3001
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

app.use( cors() )
app.use( express.json() )

const server = app.listen( PORT, () => {
  logger( `Server running on port ${PORT}` )
} )

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

//GET
app.get( '/getplayers', async ( req, res ) => {
  const players = await Player.find()
  res.json( players )
} )
//GET/PLAYERID
app.get( '/getplayers/:playerid', async ( req, res ) => {
  const player = await Player.findOne( {
    id: req.params.playerid,
  } )
  res.json( player )
} )
// ADDPLAYER
app.post( '/addplayer', async ( req, res ) => {
  const { firstname, lastname, lives } = req.body;
  const id = uuidv4();
  const newPlayer = new Player( { firstname, lastname, id, teamID: '', lives: lives } );
  await newPlayer.save();
  io.emit( 'playerAdded', newPlayer );
  res.json( newPlayer );
} );

//EDITPLAYER
app.post( '/editplayer', async ( req, res ) => {
  const { id, firstname, lastname } = req.body
  const player = await Player.findOneAndUpdate(
    { id },
    { firstname, lastname },
    { new: true }
  )
  io.emit( 'playerUpdated', player )
  res.json( player )
} )

app.post( '/removeplayer', async ( req, res ) => {
  const { id } = req.body
  const player = await Player.findOneAndDelete( { id } )
  io.emit( 'playerRemoved', id )
  res.json( player )
} )

app.post( '/updateteam', async ( req, res ) => {
  const { id, teamID } = req.body
  const player = await Player.findOneAndUpdate(
    { id },
    { teamID },
    { new: true }
  )
  io.emit( 'teamUpdated', player )
  res.json( player )
} )

app.post( '/removelive', async ( req, res ) => {
  const { id } = req.body
  const player = await Player.findOne( { id } )

  if ( player.lives > 0 ) {
    player.lives -= 1
    await player.save()
    io.emit( 'livesUpdated', player )
  }

  res.json( player )
} )

app.post( "/addlive", async ( req, res ) => {
  const { id } = req.body;
  const player = await Player.findOne( { id } );

  const settings = await GameSettings.findOne();

  if ( player.lives < settings.maximumLives ) {
    player.lives += 1;
    await player.save();
    io.emit( "livesUpdated", player );
  }

  res.json( player );
} );

app.get( "/getsettings", async ( req, res ) => {
  let settings = await GameSettings.findOne();
  if ( !settings ) {
    settings = new GameSettings();
    await settings.save();
  }
  res.json( settings );
} );

app.post( "/updatesettings", async ( req, res ) => {
  const { maximumLives } = req.body;
  let settings = await GameSettings.findOne();

  if ( !settings ) {
    settings = new GameSettings();
  }

  settings.maximumLives = maximumLives;
  await settings.save();
  res.json( settings );
  io.emit( "updateSettings" );
} );

// RESETLIVES
app.post( '/resetlives', async ( req, res ) => {
  const { maximumLives } = req.body;
  await Player.updateMany( {}, { $set: { lives: maximumLives } } );
  const players = await Player.find();
  io.emit( 'playersReset', players );
  res.json( players );
} );