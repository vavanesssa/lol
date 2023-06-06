import React from 'react';
import { useStore } from './store';

const ReadComponent = () => {
  const counter = useStore( ( state ) => state.counter );
  const game = useStore( ( state ) => state );

  return (
    <div>
      Counter: { counter }
      <br />
      Players:
      { Array.isArray( game.players ) ? (
        <ul>
          { game.players.map( ( player, index ) => (
            <li key={ index }>{ player.name }</li>
          ) ) }
        </ul>
      ) : (
        <p>No players available.</p>
      ) }

      <br />
      teams:
      { Array.isArray( game.teams ) ? (
        <ul>
          { game.teams.map( ( teams, index ) => (
            <li key={ index }>{ teams.name }</li>
          ) ) }
        </ul>
      ) : (
        <p>No teams available.</p>
      ) }

    </div>
  );
};

export default ReadComponent;
