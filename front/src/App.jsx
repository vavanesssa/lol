import React, { useEffect, useState } from 'react';
import { addPlayer, getPlayers, addLife, fetchGameSettings, updateGameSettings, resetLives, removePlayer, removeLife, editPlayer, addTeam, getTeams, editTeam, removeTeam } from './api';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import socket from './socket';

import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import style from "./styles.module.scss";
import Slider from '@mui/material/Slider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import SettingsIcon from '@mui/icons-material/Settings';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { v4 as uuidv4 } from 'uuid';

function UuidGenerator () {
  const uuid = uuidv4();
  return { uuid };
}
const App = () => {
  const [ teamName, setTeamName ] = useState( '' );
  const [ teams, setTeams ] = useState( [] );
  const [ unassignedPlayers, setUnassignedPlayers ] = useState( [] );
  const [ editingPlayer, setEditingPlayer ] = useState( null );
  const [ editingName, setEditingName ] = useState( "" );

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

    socket.on( "teamAdded", ( team ) => {
      setTeams( ( prevTeams ) => [ ...prevTeams, team ] );
    } );

    socket.on( "teamRemoved", ( teamId ) => {
      setTeams( ( prevTeams ) => prevTeams.filter( ( team ) => team.id !== teamId ) );
    } );

    return () => {
      socket.disconnect();
    };
  }, [] );

  const handleSubmit = async ( e ) => {
    e.preventDefault();
    await addPlayer( name, id, maximumLives );
    setName( '' );
    setId( '' );
  };

  const handleRemovePlayer = async ( playerId ) => {
    const removedPlayerId = await removePlayer( playerId );
    socket.emit( 'clientPlayerRemoved', removedPlayerId );
  };

  const handleTeamSubmit = async ( e ) => {
    e.preventDefault();
    const newTeam = await addTeam( teamName );
    setTeamName( "" );
    fetchTeams();
    socket.emit( "clientTeamAdded", newTeam ); // Emit event when a team is added
  };

  const handleRemoveTeam = async ( teamId ) => {
    await removeTeam( teamId );
    fetchTeams();
    socket.emit( "clientTeamRemoved", teamId ); // Emit event when a team is removed
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
          <h2>{ team.name }</h2>
          <Button onClick={ () => handleRemoveTeam( team.id ) }>Remove</Button>
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
