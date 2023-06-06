// store.js
import React, { useEffect, useState } from 'react';
import create from 'zustand';

import socket from './socket';

import * as API from './api';

export const useStore = create( ( set ) => ( {
  counter: 0,
  players: [],
  teams: [],
  settings: [],
  increment: () => set( ( state ) => ( { counter: state.counter + 1 } ) ),
  initialize: async () => {
    const response = await API.getGame();
    console.log( "game", response );
    set( { players: response.players } );
    set( { teams: response.teams } );
    set( { settings: response.settings } );
  },
  updateFromSocket: ( data ) => {
    set( ( state ) => ( { players: data.players } ) );
    set( ( state ) => ( { teams: data.teams } ) );
    set( ( state ) => ( { settings: data.settings } ) );
  },
} ) );

socket.connect();

socket.on( 'updateGame', ( data ) => {
  console.log( "updateGame" )
  useStore.getState().updateFromSocket( data );
} );