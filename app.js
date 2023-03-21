// app.js
const express = require( 'express' )
const http = require( 'http' )
const socketIO = require( 'socket.io' )
const mongoose = require( 'mongoose' )
const cors = require( 'cors' )
const app = express()
const server = http.createServer( app )
const io = socketIO( server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: [ 'GET', 'POST' ],
    credentials: true,
  },
} )

// Set strictQuery option
mongoose.set( 'strictQuery', false ) // or true, depending on your preference

// Connect to MongoDB
mongoose
  .connect(
    'mongodb+srv://lol:lol@cluster0.e7mbqki.mongodb.net/?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then( () => console.log( 'MongoDB connected' ) )
  .catch( ( err ) => console.log( err ) )

// Define the Player schema and model
const playerSchema = new mongoose.Schema( {
  playerID: String,
  hearts: Number,
} )

app.use(
  cors( {
    origin: 'http://localhost:5173',
  } )
)

const Player = mongoose.model( 'Player', playerSchema )

app.use( express.json() )

// API Routes
app.post( '/addplayer', async ( req, res ) => {
  const newPlayer = new Player( {
    playerID: req.body.playerID,
    hearts: 10,
  } )
  try {
    const savedPlayer = await newPlayer.save()
    res.status( 201 ).json( savedPlayer )
  } catch ( err ) {
    console.error( err )
    res.status( 500 ).json( {
      error: 'Failed to add player',
    } )
  }
} )

app.get( '/players', async ( req, res ) => {
  try {
    const players = await Player.find()
    res.status( 200 ).json( players )
  } catch ( err ) {
    console.error( err )
    res.status( 500 ).json( {
      error: 'Failed to get players',
    } )
  }
} )

app.put( '/players/:playerID', async ( req, res ) => {
  const { playerID } = req.params
  const { hearts } = req.body

  try {
    const updatedPlayer = await Player.findOneAndUpdate(
      {
        playerID,
      },
      {
        hearts,
      },
      {
        new: true,
      }
    )
    console.log( 'removed one' )
    io.emit( 'playerUpdated' )
    res.status( 200 ).json( updatedPlayer )
  } catch ( err ) {
    console.error( err )
    res.status( 500 ).json( {
      error: 'Failed to update player',
    } )
  }
} )

app.put( '/players', async ( req, res ) => {
  const { hearts } = req.body

  try {
    await Player.updateMany( {}, { hearts } )
    res.status( 200 ).json( {
      message: 'All players updated',
    } )
  } catch ( err ) {
    console.error( err )
    res.status( 500 ).json( {
      error: 'Failed to update all players',
    } )
  }
} )

// Set up Socket.IO connection and event handlers
io.on( 'connection', ( socket ) => {
  console.log( 'User connected' )

  // Update a player's hearts
  // Update a player's hearts
  socket.on( 'updateHearts', ( playerID, hearts ) => {
    console.log( 'remove' )
    Player.findOne(
      {
        playerID,
      },
      ( err, object ) => {
        if ( err ) {
          console.error( err )
        } else if ( object !== null ) {
          // Access the playerID property of the object
          const playerId = object.playerID
          Player.findOneAndUpdate(
            {
              playerID: playerId,
            },
            {
              hearts,
            },
            {
              new: true,
            },
            ( err, updatedPlayer ) => {
              if ( err ) {
                console.error( err )
              } else {
                io.emit( 'playerUpdated', updatedPlayer )
              }
            }
          )
        }
      }
    )
  } )

  // Set all players' hearts to the given value
  socket.on( 'setAllHearts', async ( hearts ) => {
    console.log( 'setall' )
    try {
      const updatedPlayers = await Player.updateMany(
        {},
        {
          hearts,
        }
      )
      io.emit( 'playersUpdated' )
    } catch ( err ) {
      console.error( err )
    }
  } )

  socket.on( 'disconnect', () => {
    console.log( 'User disconnected' )
  } )
} )

// Start the server
const port = process.env.PORT || 3001
server.listen( port, () => {
  console.log( `Serveur running on port ${port}` )
} )
