import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { addPlayer, getPlayers, addLife, fetchGameSettings, updateGameSettings, resetLives, removePlayer, removeLife } from './api';
import socket from './socket';

jest.mock( './api' );
jest.mock( './socket' );

beforeEach( () => {
  getPlayers.mockResolvedValue( [] );
  fetchGameSettings.mockResolvedValue( { maximumLives: 5 } );
  socket.connect.mockImplementation( () => { } );
  socket.disconnect.mockImplementation( () => { } );
  socket.on.mockImplementation( () => { } );
} );

describe( 'App component', () => {
  test( 'renders game settings', async () => {
    render( <App /> );

    await waitFor( () => screen.getByText( 'Game Settings' ) );
    expect( screen.getByText( 'Game Settings' ) ).toBeInTheDocument();
    expect( screen.getByText( 'Reset Lives' ) ).toBeInTheDocument();
    expect( screen.getByLabelText( 'Maximum Lives:' ) ).toBeInTheDocument();
    expect( screen.getByText( 'Update Maximum Lives' ) ).toBeInTheDocument();
  } );

  test( 'renders add player form', async () => {
    render( <App /> );

    await waitFor( () => screen.getByText( 'Add Player' ) );
    expect( screen.getByText( 'Add Player' ) ).toBeInTheDocument();
    expect( screen.getByLabelText( 'Firstname:' ) ).toBeInTheDocument();
    expect( screen.getByLabelText( 'Lastname:' ) ).toBeInTheDocument();
    expect( screen.getByText( 'Add Player' ) ).toBeInTheDocument();
  } );

  test( 'renders players list', async () => {
    render( <App /> );

    await waitFor( () => screen.getByText( 'Players' ) );
    expect( screen.getByText( 'Players' ) ).toBeInTheDocument();
  } );

  test( 'adds a new player', async () => {
    render( <App /> );

    addPlayer.mockResolvedValue( {
      firstname: 'John',
      lastname: 'Doe',
      id: '1',
      lives: 5,
    } );

    const firstnameInput = screen.getByLabelText( 'Firstname:' );
    const lastnameInput = screen.getByLabelText( 'Lastname:' );
    const addPlayerButton = screen.getByText( 'Add Player' );

    await userEvent.type( firstnameInput, 'John' );
    await userEvent.type( lastnameInput, 'Doe' );
    userEvent.click( addPlayerButton );

    await waitFor( () => {
      expect( addPlayer ).toHaveBeenCalledWith( 'John', 'Doe', '', 5 );
      expect( socket.emit ).toHaveBeenCalledWith( 'clientPlayerAdded', {
        firstname: 'John',
        lastname: 'Doe',
        id: '1',
        lives: 5,
      } );
    } );
  } );

  // Add more test cases as needed
} );
