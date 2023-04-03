const express = require( 'express' )
const mongoose = require( 'mongoose' )
const cors = require( 'cors' )
const { Server } = require( 'socket.io' )
const logger = require( './utils/log.js' )
const app = express()
const uuidv4 = require( 'uuid' ).v4;
const path = require( 'path' );
const PORT = process.env.PORT || 3001
const errorHandler = require( './utils/errorHandler.js' );
// MongoDB connection
const MONGODB_URI =
  'mongodb+srv://localhost:localhost@localhost.bs3q0.mongodb.net/?retryWrites=true&w=majority'
mongoose.set( 'strictQuery', false )
mongoose
  .connect( MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } )
  .then( () => logger( '✅ Base de données MongoDB connectée' ) )
  .catch( ( err ) => logger( err ) )

const gameSettingsSchema = new mongoose.Schema( {
  maximumLives: { type: Number, default: 10 },
} );
let activeUsers = 0;
const GameSettings = mongoose.model( "GameSettings", gameSettingsSchema );
const playerSchema = new mongoose.Schema( {
  name: String,
  id: String,
  teamID: String,
  lives: { type: Number, default: 10 },
} )
const Player = mongoose.model( 'Player', playerSchema )

const teamSchema = new mongoose.Schema( {
  name: String,
  id: String,
  createdAt: { type: Date, default: Date.now },
} );
const Team = mongoose.model( 'Team', teamSchema );

// App Middlewares
app.use( cors() )
app.use( express.json() )
app.use( errorHandler );
app.use( express.static( path.join( __dirname, 'front', 'dist' ) ) );

const server = app.listen( PORT, () => {
  logger( `✅ Serveur démarré (port ${PORT})` )
} )

//Socket Init
const io = new Server( server, {
  cors: {
    origin: '*',
  },
} )
path: '/socket',

io.on( 'connection', ( socket ) => {
  activeUsers++; // Incrémenter le nombre d'utilisateurs actifs
  logger( `🟢 Utilisateur connecté. Total des utilisateurs connectés : ${activeUsers}` );

  socket.on( 'disconnect', () => {

    activeUsers--; // Décrémenter le nombre d'utilisateurs actifs
    logger( `🔴 Utilisateur déconnecté. Total des utilisateurs connectés : ${activeUsers}` );
  } );
} );

// API

app.get( '/api/game', async ( req, res ) => {
  try {
    const players = await Player.find();
    const settings = await GameSettings.findOne();
    const teams = await Team.find();
    res.json( { players, settings, teams } );
    // logger(` GET / game - Retrieved ${players.length} players, ${teams.length} teams, and game settings`);
  } catch ( err ) {
    logger( `Error: ${err} ` );
    return res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

app.get( '/api/getplayers', async ( req, res ) => {
  try {
    const players = await Player.find();
    res.json( players );
    // logger( ` GET / getplayers - Retrieved ${players.length} players ` );
  } catch ( err ) {
    logger( `Error: ${err} ` );
    return res.status( 500 ).json( { error: 'Internal Server Error' } );
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
    return res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

app.post( '/api/addplayer', async ( req, res ) => {
  const { name, lives } = req.body;
  try {
    const id = uuidv4();
    const newPlayer = new Player( { name, id, teamID: '', lives: lives } );
    await newPlayer.save();
    io.emit( 'playerAdded', newPlayer );
    res.json( newPlayer );
    logger( `POST /addplayer - Added player: ${name}` );
  } catch ( err ) {
    logger( `Error: ${err}` );
    return res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

app.post( '/api/editplayer', async ( req, res ) => {
  console.log( req.body )
  const { id, name, teamID } = req.body;
  try {
    const player = await Player.findOneAndUpdate(
      { id },
      { name, teamID },
      { new: true }
    );
    io.emit( 'playerUpdated', player );
    res.json( player );
    logger( `POST /editplayer - Updated player: ${name} ` );
  } catch ( err ) {
    logger( `Error: ${err}` );
    return res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

app.post( '/api/removeplayer', async ( req, res ) => {
  const { id } = req.body;
  try {
    const player = await Player.findOneAndDelete( { id } );
    io.emit( 'playerRemoved', id );
    res.json( player );
    logger( `POST /removeplayer - Removed player: ${player.name}` );
  } catch ( err ) {
    logger( `Error: ${err}` );
    return res.status( 500 ).json( { error: 'Internal Server Error' } );
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
    return res.status( 500 ).json( { error: 'Internal Server Error' } );
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
    logger( `POST /removelive - Removed live from ${player.name} , lives left: ${player.lives}` );
  } catch ( err ) {
    logger( `Error: ${err}` );
    return res.status( 500 ).json( { error: 'Internal Server Error' } );
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
    logger( `POST / addlive - Added live to ${player.name} , lives left: ${player.lives} ` );
  } catch ( err ) {
    logger( `Error: ${err} ` );
    return res.status( 500 ).json( { error: "Internal Server Error" } );
  }
} );

app.get( "/api/getsettings", async ( req, res ) => {
  // logger( "GET /getsettings" );
  try {
    let settings = await GameSettings.findOne();
    if ( !settings ) {
      settings = new GameSettings();
      await settings.save();
    }
    res.json( settings );
  } catch ( err ) {
    logger( err );
    return res.status( 500 ).json( { error: "Internal Server Error" } );
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
    return res.status( 500 ).json( { error: "Internal Server Error" } );
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
    return res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

app.post( '/editplayer', ( req, res ) => {
  const { id, name } = req.body;

  const playerIndex = players.findIndex( ( player ) => player.id === id );

  if ( playerIndex !== -1 ) {
    players[ playerIndex ].name = name;
  }

  res.json( { success: true } );
} );

// TEAMS

app.post( '/api/addteam', async ( req, res ) => {
  const { name } = req.body;
  try {
    const id = uuidv4();
    const newTeam = new Team( { name, id } );
    await newTeam.save();
    io.emit( 'teamAdded', newTeam );
    res.json( newTeam );
    logger( `POST /addTeam - Added Team: ${name}` );
  } catch ( err ) {
    logger( `Error: ${err}` );
    return res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

// app.post( '/api/addteam', async ( req, res ) => {
//   const { name } = req.body;
//   try {
//     const uniqueId = uuidv4();
//     const team = new Team( { name, uniqueId } );
//     await team.save();
//     io.emit( 'teamAdded', team );
//     res.json( team );
//     logger( `POST /addteam - Added team: ${name}` );
//   } catch ( err ) {
//     logger( `Error: ${err}` );
//     return res.status( 500 ).json( { error: 'Internal Server Error' } );
//   }
// } );

app.get( '/api/getteams', async ( req, res ) => {
  try {
    const teams = await Team.find();
    res.json( teams );
    // logger( `GET /getteams - Retrieved ${teams.length} teams` );
  } catch ( err ) {
    logger( `Error: ${err}` );
    return res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

app.post( '/api/editteam', async ( req, res ) => {
  const { id, name } = req.body;

  try {
    const team = await Team.findOneAndUpdate(
      { id },
      { name },
      { new: true }
    );
    io.emit( 'teamUpdated', team );
    res.json( team );
    logger( `POST /editteam - Updated team: ${name}` );
  } catch ( err ) {
    logger( `Error: ${err}` );
    return res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

app.post( '/api/removeteam', async ( req, res ) => {
  const { id } = req.body;
  try {
    const team = await Team.findOneAndDelete( { id } );
    io.emit( 'teamRemoved', id );
    res.json( team );
    logger( `POST /removeteam - Removed team: ${team.name}` );
  } catch ( err ) {
    logger( `Error: ${err}` );
    return res.status( 500 ).json( { error: 'Internal Server Error' } );
  }
} );

const routes = app._router.stack.filter( ( r ) => r.route ).map( ( r ) => r.route.path + '\n' );
console.log( `🟨 Liste des API:\n${routes.join( '' )}` );
