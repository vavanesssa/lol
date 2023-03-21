import React, { useEffect, useState } from 'react';
import { addPlayer, getPlayers, addLife, fetchGameSettings, updateGameSettings, resetLives, removePlayer, removeLife } from './api';
import Button from '@mui/material/Button';
import socket from './socket';

import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import style from "./styles.module.scss";

const App = () => {
  const [ players, setPlayers ] = useState( [] );
  const [ firstname, setFirstname ] = useState( '' );
  const [ lastname, setLastname ] = useState( '' );
  const [ id, setId ] = useState( '' );
  const [ maximumLives, setMaximumLives ] = useState( 0 );
  const [ searchQuery, setSearchQuery ] = useState( "" );

  const fetchPlayers = async () => {
    console.log( 'fetching players' )
    const initialPlayers = await getPlayers();
    setPlayers( initialPlayers );
  };

  const fetchGameSettingsData = async () => {
    console.log( 'fetching game settings' );
    const settings = await fetchGameSettings();
    setMaximumLives( settings.maximumLives );
  };

  const updateGameSettingsData = async () => {
    await updateGameSettings( maximumLives );
  };

  const resetLivesData = async () => {
    const updatedPlayers = await resetLives( maximumLives );
    setPlayers( updatedPlayers );
  };

  const filteredPlayers = players.filter( ( player ) => {
    const fullName = `${player.firstname} ${player.lastname}`.toLowerCase();
    return fullName.includes( searchQuery.toLowerCase() );
  } );

  useEffect( () => {
    fetchPlayers();
    fetchGameSettingsData();
  }, [] );

  useEffect( () => {
    socket.connect();

    socket.on( 'playerAdded', ( player ) => {
      setPlayers( ( prevPlayers ) => {
        // Check if the player already exists in the players array
        const existingPlayer = prevPlayers.find( ( prevPlayer ) => prevPlayer.id === player.id );

        // If the player doesn't exist, add the new player to the array
        if ( !existingPlayer ) {
          return [ ...prevPlayers, player ];
        }

        // Otherwise, return the unmodified players array
        return prevPlayers;
      } );
    } );

    socket.on( 'playerRemoved', ( playerId ) => {
      setPlayers( ( prevPlayers ) => prevPlayers.filter( ( player ) => player.id !== playerId ) );
    } );

    socket.on( 'livesUpdated', ( updatedPlayer ) => {
      setPlayers( ( prevPlayers ) =>
        prevPlayers.map( ( player ) => ( player.id === updatedPlayer.id ? updatedPlayer : player ) ),
      );
    } );

    socket.on( 'updateSettings', () => {
      fetchGameSettingsData();
    } );

    socket.on( 'playersReset', ( players ) => {
      setPlayers( players );
    } );

    return () => {
      socket.disconnect();
    };
  }, [] );

  const handleSubmit = async ( e ) => {
    e.preventDefault();
    await addPlayer( firstname, lastname, id, maximumLives );
    setFirstname( '' );
    setLastname( '' );
    setId( '' );
  };

  const handleRemovePlayer = async ( playerId ) => {
    const removedPlayerId = await removePlayer( playerId );
    socket.emit( 'clientPlayerRemoved', removedPlayerId );
  };

  const handleRemoveLife = async ( playerId ) => {
    const player = players.find( ( p ) => p.id === playerId );

    if ( player && player.lives <= 0 ) {
      console.log( "min reached" );
      return;
    }

    const updatedPlayer = await removeLife( playerId );
    socket.emit( "clientLivesUpdate", updatedPlayer );
  };

  const handleAddLife = async ( playerId ) => {
    const player = players.find( ( p ) => p.id === playerId );

    if ( player && player.lives >= maximumLives ) {
      console.log( "max reached" );
      return;
    }

    const updatedPlayer = await addLife( playerId );
    socket.emit( "clientLivesUpdate", updatedPlayer );
  };

  // MUI

  const Search = styled( 'div' )( ( { theme } ) => ( {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha( theme.palette.common.white, 0.15 ),
    '&:hover': {
      backgroundColor: alpha( theme.palette.common.white, 0.25 ),
    },
    marginLeft: 0,
    width: '100%',
    [ theme.breakpoints.up( 'sm' ) ]: {
      marginLeft: theme.spacing( 1 ),
      width: 'auto',
    },
  } ) );

  const SearchIconWrapper = styled( 'div' )( ( { theme } ) => ( {
    padding: theme.spacing( 0, 2 ),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } ) );

  const StyledInputBase = styled( InputBase )( ( { theme } ) => ( {
    color: 'inherit',
    '& .MuiInputBase-input': {
      padding: theme.spacing( 1, 1, 1, 0 ),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing( 4 )})`,
      transition: theme.transitions.create( 'width' ),
      width: '100%',
      [ theme.breakpoints.up( 'sm' ) ]: {
        width: '12ch',
        '&:focus': {
          width: '20ch',
        },
      },
    },
  } ) );

  const SearchAppBar = () => {
    return (
      <Box sx={ { flexGrow: 1 } }>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={ { mr: 2 } }
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={ { flexGrow: 1, display: { xs: 'none', sm: 'block' } } }
            >
              <img src="logo.png" className={ style.logo } />
            </Typography>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                value={ searchQuery }
                onChange={ ( e ) => setSearchQuery( e.target.value ) }
                placeholder="Rechercher..."
                inputProps={ { 'aria-label': 'rechercher' } }
              />
            </Search>
          </Toolbar>
        </AppBar>
      </Box>
    );
  }

  return (
    <div>
      <SearchAppBar />
      <div>
        <br /><br /><br /><br /><br /><br /><br />
        <h2>Game Settings</h2>
        <button onClick={ resetLivesData }>Reset Lives</button>
        <Button onClick={ resetLivesData } variant="contained">Hello World</Button>

        <label>
          Maximum Lives:
          <input
            type="number"
            min="1"
            value={ maximumLives }
            onChange={ ( e ) => setMaximumLives( parseInt( e.target.value, 10 ) ) }
          />
        </label>
        <button onClick={ updateGameSettingsData }>Update Maximum Lives</button>

      </div>
      <h1>Add Player</h1>
      <form onSubmit={ handleSubmit }>
        <label>
          Firstname:
          <input type="text" value={ firstname } onChange={ ( e ) => setFirstname( e.target.value ) } />
        </label>
        <label>
          Lastname:
          <input type="text" value={ lastname } onChange={ ( e ) => setLastname( e.target.value ) } />
        </label>

        <button type="submit">Add Player</button>
      </form>
      <h2>Players</h2>
      <label>
        Search:

      </label>
      <ul>
        { filteredPlayers.map( ( player ) => (
          <li key={ player.id }>
            <Button onClick={ () => handleRemovePlayer( player.id ) }>🗑️</Button>
            <Button onClick={ () => handleRemoveLife( player.id ) }>-</Button>
            <Button onClick={ () => handleAddLife( player.id ) }>+</Button>
            { player.firstname } { player.lastname }{ " " }
            <span>
              { Array( player.lives )
                .fill( "😂" )
                .join( "" ) }
              <span style={ { opacity: 0.3 } }>
                { maximumLives - player.lives > 0
                  ? Array( maximumLives - player.lives )
                    .fill( "😂" )
                    .join( "" )
                  : "" }
              </span>
            </span>
          </li>
        ) ) }

      </ul>
    </div>
  );
};

export default App;
