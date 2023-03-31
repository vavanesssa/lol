import React, { useEffect, useState } from 'react';
import { addPlayer, getPlayers, addLife, fetchGameSettings, updateGameSettings, resetLives, removePlayer, removeLife, editPlayer, addTeam, getTeams, editTeam, removeTeam } from './api';

import socket from './socket';

import { Button, Box, IconButton, TextField, Slider, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Edit as EditIcon, DeleteForever as DeleteForeverIcon, Settings as SettingsIcon } from '@mui/icons-material';
import style from "./styles.module.scss";
import useMediaQuery from '@mui/material/useMediaQuery';

// Custom components

const App = () => {
  const [ teamName, setTeamName ] = useState( '' );
  const [ teams, setTeams ] = useState( [] );
  const [ editingTeam, setEditingTeam ] = useState( null );
  const [ editingTeamName, setEditingTeamName ] = useState( '' );
  const [ editingPlayer, setEditingPlayer ] = useState( null );
  const [ editingName, setEditingName ] = useState( "" );
  const [ selectedTeam, setSelectedTeam ] = useState( null );

  const [ players, setPlayers ] = useState( [] );
  const [ name, setName ] = useState( '' );
  const [ id, setId ] = useState( '' );
  const [ maximumLives, setMaximumLives ] = useState( 0 );
  const [ searchQuery, setSearchQuery ] = useState( "" );
  const [ open, setOpen ] = React.useState( false );
  const theme = useTheme();
  const fullScreen = useMediaQuery( theme.breakpoints.down( 'md' ) );

  const handleClickOpen = () => {
    setOpen( true );
  };

  const handleClose = () => {
    setOpen( false );
  };

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
    handleClose()
  };

  const handleEditSubmit = async ( playerId, e ) => {
    e.preventDefault();
    if ( !editingName ) return;

    // Mettre à jour le prénom du joueur avec l'API
    const updatedPlayer = await editPlayer( playerId, editingName );
    if ( updatedPlayer.success ) {
      setPlayers( ( prevPlayers ) =>
        prevPlayers.map( ( player ) =>
          player.id === playerId ? { ...player, name: editingName } : player,
        ),
      );
    }
    setTimeout( () => {
      fetchPlayers();
    }, 200 );

    setEditingPlayer( null );
    setEditingName( '' );
  };

  const filteredPlayers = players.filter( ( player ) => {
    const fullName = `${player.name}`.toLowerCase();
    return fullName.includes( searchQuery.toLowerCase() );
  } );

  useEffect( () => {
    fetchPlayers();
    fetchGameSettingsData();
    fetchTeams();
    setInterval( () => {
      fetchPlayers()
    }, 60000 );
  }, [] );

  useEffect( () => {
    const handlePlayerAdded = ( player ) => {
      console.log( 'SOCKET /playerAdded', player );
      setPlayers( prevPlayers => {
        // Check if the player already exists in the players array
        const existingPlayer = prevPlayers.find( prevPlayer => prevPlayer.id === player.id );

        // If the player doesn't exist, add the new player to the array
        if ( !existingPlayer ) {
          return [ ...prevPlayers, player ];
        }

        // Otherwise, return the unmodified players array
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

    const handleUpdateSettings = () => {
      console.log( 'SOCKET /updateSettings' );
      fetchGameSettingsData();
    };

    const handlePlayersReset = ( players ) => {
      console.log( 'SOCKET /playersReset', players );
      setPlayers( players );
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
    console.log( "Front/handleSubmit", { name, id, maximumLives } );
    e.preventDefault();
    await addPlayer( name, id, maximumLives );
    setName( '' );
    setId( '' );
    console.log( "Front/handleSubmit complete" );
  };

  const handleRemovePlayer = async ( playerId ) => {
    console.log( "Front/handleRemovePlayer", { playerId } );
    const removedPlayerId = await removePlayer( playerId );
    socket.emit( 'clientPlayerRemoved', removedPlayerId );
    console.log( "Front/handleRemovePlayer complete" );
  };

  const handleTeamSubmit = async ( e ) => {
    console.log( "Front/handleTeamSubmit", { teamName } );
    e.preventDefault();
    const newTeam = await addTeam( teamName );
    setTeamName( '' );
    fetchTeams();
    socket.emit( 'teamAdded', newTeam );
    console.log( "Front/handleTeamSubmit complete" );
  };

  const handleEditTeam = async ( id, e ) => {
    console.log( "Front/handleEditTeam", { id, editingTeamName } );
    e.preventDefault();
    if ( !editingTeamName ) return;

    const updatedTeam = await editTeam( id, editingTeamName );
    if ( updatedTeam.success ) {
      setTeams( ( prevTeams ) =>
        prevTeams.map( ( team ) =>
          team.id === id ? { ...team, name: editingTeamName } : team
        )
      );
    }

    setEditingTeam( null );

    setEditingTeamName( '' );
  };

  const handleRemoveTeam = async ( id ) => {
    await removeTeam( id );
    fetchTeams();

  };

  const fetchTeams = async () => {
    const teams = await getTeams();
    setTeams( teams );
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

  return (
    <div>
      <img src="logo.png" className={ style.logo } />
      <div>

        <div className={ style.settings }>
          <IconButton variant="outlined" onClick={ handleClickOpen }>
            <SettingsIcon />
          </IconButton>
        </div>
        <Dialog
          fullScreen={ fullScreen }
          open={ open }
          onClose={ handleClose }
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">
            { "PARAMETRES" }
          </DialogTitle>
          <DialogContent>
            <Box width={ 300 }>
              <br />
              Nombre de vies maximum : { maximumLives }
              <Slider value={ maximumLives } min={ 1 }
                max={ 20 } aria-label="Default" valueLabelDisplay="auto" onChange={ ( e ) => setMaximumLives( parseInt( e.target.value, 10 ) ) } />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={ updateGameSettingsData }>
              APPLIQUER LA LIMITE
            </Button>
            <Button onClick={ resetLivesData } autoFocus>
              REINITIALISER LES VIES
            </Button>

            <Button onClick={ handleClose } autoFocus>
              FERMER
            </Button>
          </DialogActions>
        </Dialog>

        <br />

      </div>

      <form onSubmit={ handleTeamSubmit }>
        <TextField
          size="small"
          value={ teamName }
          onChange={ ( e ) => setTeamName( e.target.value ) }
          id="outlined-basic"
          label="Nom de l'équipe"
          variant="outlined"
        />
        <Button type="submit" variant="outlined">
          Ajouter une équipe
        </Button>
      </form>
      { teams.map( ( team ) => (
        <div key={ team.id }>
          <h2>
            { editingTeam === team.id ? (
              <form onSubmit={ ( e ) => handleEditTeam( team.id, e ) }>
                <TextField
                  value={ editingTeamName }
                  onChange={ ( e ) => setEditingTeamName( e.target.value ) }
                  size="small"
                  autoFocus
                />
                <Button type="submit" variant="outlined">
                  Modifier
                </Button>
                <Button
                  onClick={ () => {
                    setEditingTeam( null );
                    setEditingTeamName( "" );
                  } }
                >
                  Annuler
                </Button>
              </form>
            ) : (
              <>
                { team.name }{ " " }
                <IconButton onClick={ () => setEditingTeam( team.id ) }>
                  <EditIcon />
                </IconButton>
              </>
            ) }
          </h2>
          <Button onClick={ () => handleRemoveTeam( team.id ) }>Remove</Button>
          <span>{ team.key }</span>
        </div>
      ) ) }

      <form onSubmit={ handleSubmit }>
        <br />

        <TextField size="small" value={ name } onChange={ ( e ) => setName( e.target.value ) } id="outlined-basic" label="Prénom" variant="outlined" />

        <Button type="submit" variant="outlined">Ajouter un joueur</Button>
      </form>

      <label>
        <br />
        <TextField value={ searchQuery }
          onChange={ ( e ) => setSearchQuery( e.target.value ) }
          placeholder="Rechercher..." label="Rechercher" variant="outlined" />

      </label>
      <ul className={ style.listwrapper }>
        { filteredPlayers.map( ( player ) => (
          <li className={ style.list } key={ player.id }>
            <div className={ style.userActions }>
              <IconButton
                color="secondary"
                aria-label="edit"
                onClick={ () => {
                  setEditingPlayer( player.id );
                  setEditingName( player.name );
                } }
              >
                <EditIcon />
              </IconButton>

            <IconButton onClick={ () => handleRemovePlayer( player.id ) } color="secondary" aria-label="add an alarm">
              <DeleteForeverIcon />
            </IconButton>
            <IconButton onClick={ () => handleRemoveLife( player.id ) } color="secondary" aria-label="add an alarm">
              <RemoveIcon />
            </IconButton>
            <IconButton onClick={ () => handleAddLife( player.id ) } color="secondary" aria-label="add an alarm">
              <AddIcon />
            </IconButton>
            </div>
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
                        setEditingPlayer( null );
                        setEditingName( "" );
                      } }
                    >
                      Annuler
                    </Button>
                  </form>
                ) : (
                  `${player.name}`
                ) }
              </span>

            </span>

          </li>
        ) ) }

      </ul>
    </div>
  );
};

export default App;
