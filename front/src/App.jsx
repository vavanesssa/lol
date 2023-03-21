import React, { useEffect, useState } from 'react';
import { addPlayer, getPlayers, addLife } from './api';

import socket from './socket';

const App = () => {
  const [ players, setPlayers ] = useState( [] );
  const [ firstname, setFirstname ] = useState( '' );
  const [ lastname, setLastname ] = useState( '' );
  const [ id, setId ] = useState( '' );

  const fetchPlayers = async () => {
    const initialPlayers = await getPlayers();
    setPlayers( initialPlayers );
  };

  useEffect( () => {

    fetchPlayers();
  }, [] );

  useEffect( () => {
    socket.connect();

    socket.on( 'playerAdded', ( player ) => {
      fetchPlayers();
    } );

    socket.on( 'playerRemoved', ( playerId ) => {
      fetchPlayers();
    } );

    socket.on( 'livesUpdated', ( updatedPlayer ) => {
      fetchPlayers();
    } );

    return () => {
      socket.disconnect();
    };
  }, [] );

  const handleSubmit = async ( e ) => {
    e.preventDefault();
    await addPlayer( firstname, lastname, id );
    setFirstname( '' );
    setLastname( '' );
    setId( '' );
  };

  const handleRemoveLife = async ( playerId ) => {
    const response = await fetch( 'http://localhost:3001/removelive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify( { id: playerId } ),
    } );
    const updatedPlayer = await response.json();
    socket.emit( 'clientLivesUpdate', updatedPlayer );
  };

  const handleAddLife = async ( playerId ) => {
    const updatedPlayer = await addLife( playerId );
    socket.emit( 'clientLivesUpdate', updatedPlayer );
  };

  return (
    <div>
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
      <ul>
        { players.map( ( player ) => (
          <li key={ player.id }>
            <button onClick={ () => handleRemoveLife( player.id ) }>-</button>
            <button onClick={ () => handleAddLife( player.id ) }>+</button>

            { player.firstname } { player.lastname }{ ' ' }
            { Array( player.lives )
              .fill( '😂' )
              .join( '' ) }
          </li>
        ) ) }
      </ul>
    </div>
  );
};

export default App;
