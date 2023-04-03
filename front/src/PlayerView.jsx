import React, { useEffect, useState } from 'react';
import * as API from './api';
import socket from './socket';
import { Button, Box, IconButton, TextField, Slider, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Edit as EditIcon, DeleteForever as DeleteForeverIcon, Settings as SettingsIcon } from '@mui/icons-material';
import style from "./styles.module.scss";
import useMediaQuery from '@mui/material/useMediaQuery';
import Settings from './Settings';
import Player from './PlayerView';

const Admin = () => {
  const [ teamName, setTeamName ] = useState( '' );
  const [ teams, setTeams ] = useState( [] );
  const [ editingTeam, setEditingTeam ] = useState( '' );
  const [ editingTeamName, setEditingTeamName ] = useState( '' );
  const [ editingPlayer, setEditingPlayer ] = useState( '' );
  const [ editingName, setEditingName ] = useState( "" );
  const [ selectedTeam, setSelectedTeam ] = useState( '' );
  const [ players, setPlayers ] = useState( [] );
  const [ name, setName ] = useState( '' );
  const [ id, setId ] = useState( '' );
  const [ maximumLives, setMaximumLives ] = useState( 0 );
  const [ searchQuery, setSearchQuery ] = useState( "" );
  const theme = useTheme();

  const fetchGame = async () => {
    console.log( 'REACT/ fetching game' )
    const initialPlayers = await API.getPlayers();
    setPlayers( initialPlayers );
  };

  const fetchPlayers = async () => {
    console.log( 'REACT/ fetching players' )
    const initialPlayers = await API.getPlayers();
    setPlayers( initialPlayers );
  };

  const fetchGameSettings = async () => {
    console.log( 'REACT/ fetching game settings' );
    const settings = await API.fetchGameSettings();
    setMaximumLives( settings.maximumLives );
  };

  const fetchTeams = async () => {
    console.log( "REACT/fetchTeams" );
    const teams = await API.getTeams();
    setTeams( teams );
    console.log( "REACT/fetchTeams complete" );
  };

  const fetchAllData = () => {
    fetchGameSettings(),
      fetchTeams(),
      fetchPlayers(),
      console.log( "REACT/fetchAllData complete" );
  };

  const handleEditSubmit = async ( playerId, e ) => {
    e.preventDefault();
    if ( !editingName ) return;
    const updatedPlayer = await API.editPlayer( playerId, editingName, selectedTeam );
    if ( updatedPlayer.success ) {
      setPlayers( ( prevPlayers ) =>
        prevPlayers.map( ( player ) =>
          player.id === playerId ? { ...player, name: editingName, teamID: selectedTeam } : player
        )
      );
    }

    setEditingPlayer( '' );
    setEditingName( '' );
    setSelectedTeam( '' );
  };

  const filteredPlayers = players.filter( ( player ) => {
    const fullName = `${player.name}`.toLowerCase();
    return fullName.includes( searchQuery.toLowerCase() );
  } );

  const PlayerItem = ( { player } ) => {
    return (
      <li className={ style.list } key={ player.id }>

        <span>
          { Array( player.lives )
            .fill()
            .map( ( _, index ) => (
              <img src="laugh.png" alt="emoji" className={ style.emoji } key={ index } />
            ) ) }
          <span style={ { opacity: 0.3 } }>
            { maximumLives - player.lives > 0
              ? Array( maximumLives - player.lives )
                .fill()
                .map( ( _, index ) => (
                  <img src="laugh.png" alt="emoji" className={ style.emoji } key={ index } />
                ) )
              : "" }
          </span>

          <span className={ player.lives == 0 ? style.dead : style.username }>
            { editingPlayer === player.id ? (
              <form onSubmit={ ( e ) => handleEditSubmit( player.id, e ) }>
                <TextField
                  value={ editingName }
                  onChange={ ( e ) => setEditingName( e.target.value ) }
                  size="small"
                  autoFocus
                />

                <FormControl variant="outlined" size="small">
                  <InputLabel htmlFor="team-selector">Équipe</InputLabel>
                  <Select
                    native
                    value={ selectedTeam }
                    onChange={ ( e ) => setSelectedTeam( e.target.value ) }
                    label="Équipe"
                    inputProps={ {
                      name: 'team',
                      id: 'team-selector',
                    } }
                    style={ { minWidth: '150px', marginLeft: '10px' } }
                  >
                    <option aria-label="None" value="" />
                    { teams.map( ( team ) => (
                      <option key={ team.id } value={ team.id }>{ team.name }</option>
                    ) ) }
                  </Select>
                </FormControl>

                <Button type="submit" variant="outlined">
                  Modifier
                </Button>
                <Button
                  onClick={ () => {
                    setEditingPlayer( "" );
                    setEditingName( "" );
                  } }
                >
                  Annuler
                </Button>
              </form>
            ) : (
              <div>
                { player.name } { player.teamID && teams.find( ( team ) => team.id === player.teamID )?.name }
              </div>

            ) }
          </span>

        </span>

      </li>
    )
  }

  useEffect( () => {

    fetchGameSettings();
    fetchTeams();
    fetchPlayers();
    setInterval( () => {
      fetchPlayers()
    }, 10000 );
  }, [] );

  useEffect( () => {
    const handlePlayerAdded = ( player ) => {
      console.log( 'SOCKET /playerAdded', player );
      setPlayers( prevPlayers => {
        const existingPlayer = prevPlayers.find( prevPlayer => prevPlayer.id === player.id );
        if ( !existingPlayer ) {
          return [ ...prevPlayers, player ];
        }
        return prevPlayers;
      } );
    };

    const handlePlayerRemoved = ( playerId ) => {
      console.log( 'SOCKET /playerRemoved', playerId );
      setPlayers( prevPlayers => prevPlayers.filter( player => player.id !== playerId ) );
    };

    const handleLivesUpdated = ( updatedPlayer ) => {
      console.log( 'SOCKET /livesUpdated', updatedPlayer );
      setPlayers( prevPlayers =>
        prevPlayers.map( player => ( player.id === updatedPlayer.id ? updatedPlayer : player ) ),
      );
    };

    const handleTeamAdded = ( team ) => {
      console.log( 'SOCKET /teamAdded', team );
      setTeams( ( prevTeams ) => {
        const existingTeam = prevTeams.find( ( prevTeam ) => prevTeam.id === team.id );

        if ( !existingTeam ) {
          return [ ...prevTeams, team ];
        }

        return prevTeams;
      } );
      socket.emit( 'teamAdded', team );
    };

    const handleTeamRemoved = ( teamId ) => {
      console.log( 'SOCKET /teamRemoved', teamId );
      fetchTeams();
      socket.emit( 'teamRemoved', teamId );
    };

    const handleTeamUpdated = ( teamId ) => {
      console.log( 'SOCKET /teamUpdated', teamId );
      fetchTeams();
      socket.emit( 'teamUpdated', teamId );
    };

    const handlePlayersReset = ( players ) => {
      console.log( 'SOCKET /playersReset', players );
      setPlayers( players );
    };

    const handleUpdateSettings = () => {
      console.log( 'SOCKET /updateSettings' );
      fetchGameSettings();
    };

    socket.connect();

    socket.on( 'playerAdded', handlePlayerAdded );
    socket.on( 'playerRemoved', handlePlayerRemoved );
    socket.on( 'livesUpdated', handleLivesUpdated );
    socket.on( 'updateSettings', handleUpdateSettings );
    socket.on( 'playersReset', handlePlayersReset );
    socket.on( 'teamAdded', handleTeamAdded );
    socket.on( 'teamUpdated', handleTeamUpdated );
    socket.on( 'teamRemoved', handleTeamRemoved );

    return () => {
      socket.disconnect();

      socket.off( 'playerAdded', handlePlayerAdded );
      socket.off( 'playerRemoved', handlePlayerRemoved );
      socket.off( 'livesUpdated', handleLivesUpdated );
      socket.off( 'updateSettings', handleUpdateSettings );
      socket.off( 'playersReset', handlePlayersReset );
      socket.off( 'teamAdded', handleTeamAdded );
      socket.off( 'teamUpdated', handleTeamUpdated );
      socket.off( 'teamRemoved', handleTeamRemoved );
    };
  }, [] );

  const handleSubmit = async ( e ) => {
    console.log( "REACT/handleSubmit", { name, id, maximumLives } );
    e.preventDefault();
    await API.addPlayer( name, id, maximumLives );
    setName( '' );
    setId( '' );
    console.log( "REACT/handleSubmit complete" );
  };

  const handleRemovePlayer = async ( playerId ) => {
    console.log( "REACT/handleRemovePlayer", { playerId } );
    const removedPlayerId = await API.removePlayer( playerId );
    socket.emit( 'clientPlayerRemoved', removedPlayerId );
    console.log( "REACT/handleRemovePlayer complete" );
  };

  const handleTeamSubmit = async ( e ) => {
    console.log( "REACT/handleTeamSubmit", { teamName } );
    e.preventDefault();
    const newTeam = await API.addTeam( teamName );
    setTeamName( '' );
    fetchTeams();
    socket.emit( 'teamAdded', newTeam );
    console.log( "REACT/handleTeamSubmit complete" );
  };

  const handleEditTeam = async ( id, e ) => {
    console.log( "REACT/handleEditTeam", { id, editingTeamName } );
    e.preventDefault();
    if ( !editingTeamName ) return;

    const updatedTeam = await API.editTeam( id, editingTeamName );
    if ( updatedTeam.success ) {
      setTeams( ( prevTeams ) =>
        prevTeams.map( ( team ) =>
          team.id === id ? { ...team, name: editingTeamName } : team
        )
      );
    }

    setEditingTeam( "" );
    setEditingTeamName( '' );
    console.log( "REACT/handleEditTeam complete" );
  };

  const handleRemoveTeam = async ( id ) => {
    console.log( "REACT/handleRemoveTeam", { id } );
    await API.removeTeam( id );
    fetchTeams();
    console.log( "REACT/handleRemoveTeam complete" );
  };

  const handleRemoveLife = async ( playerId ) => {
    console.log( "REACT/handleRemoveLife", { playerId } );
    const player = players.find( ( p ) => p.id === playerId );

    if ( player && player.lives <= 0 ) {
      console.log( "min reached" );
      return;
    }

    const updatedPlayer = await API.removeLife( playerId );
    socket.emit( "clientLivesUpdate", updatedPlayer );
    console.log( "REACT/handleRemoveLife complete" );
  };

  const handleAddLife = async ( playerId ) => {
    console.log( "REACT/handleAddLife", { playerId } );
    const player = players.find( ( p ) => p.id === playerId );

    if ( player && player.lives >= maximumLives ) {
      console.log( "max reached" );
      return;
    }

    const updatedPlayer = await API.addLife( playerId );
    socket.emit( "clientLivesUpdate", updatedPlayer );
  };

  return (
    <div>
      <img src="logo.png" className={ style.logo } /> { selectedTeam }
      <div>
      </div>

      <label>
        <br />
        <TextField value={ searchQuery }
          onChange={ ( e ) => setSearchQuery( e.target.value ) }
          placeholder="Rechercher..." label="Rechercher" variant="outlined" />

      </label>
      <ul className={ style.listwrapper }>
        { filteredPlayers.map( ( player ) => (

          <PlayerItem player={ player } />

        ) ) }
      </ul>

    </div>
  );
};

export default Admin;
