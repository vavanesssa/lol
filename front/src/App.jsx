import React, { useEffect, useState } from 'react';
import { addPlayer, getPlayers, addLife, fetchGameSettings, updateGameSettings, resetLives, removePlayer, removeLife } from './api';

import socket from './socket';

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

  return (
    <div>
      <div>

        <h2>Game Settings</h2>
        <button onClick={ resetLivesData }>Reset Lives</button>

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
        <input
          type="text"
          value={ searchQuery }
          onChange={ ( e ) => setSearchQuery( e.target.value ) }
        />
      </label>
      <ul>
        { filteredPlayers.map( ( player ) => (
          <li key={ player.id }>
            <button onClick={ () => handleRemovePlayer( player.id ) }>🗑️</button>

            <button onClick={ () => handleRemoveLife( player.id ) }>-</button>
            <button onClick={ () => handleAddLife( player.id ) }>+</button>
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
