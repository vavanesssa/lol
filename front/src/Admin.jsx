import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react';
import * as API from './api';
import socket from './socket';
import { Button, Box, IconButton, TextField, Slider, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Edit as EditIcon, DeleteForever as DeleteForeverIcon, Settings as SettingsIcon } from '@mui/icons-material';
import style from "./styles.module.scss";
import useMediaQuery from '@mui/material/useMediaQuery';
import Settings from './Settings';
import Player from './PlayerView';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './style.css';
import { Team } from './Team';

const Admin = () => {
  const [ game, setGame ] = useState();
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

  const fetchGaming = async () => {
    const game = await API.getGame();
    console.log( 'REACT/ fetching gaming',game)
    setGame( game );
  };

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
    console.log("user submit ", e.target.value,e.target[0].value,e)
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

  useEffect( () => {
    fetchGaming();
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

  /****************AG-GRID****************************************************************************/
  const gameSetting = {"players":[{"_id":"642b0885321b61d5db5de379","name":"Lucie","id":"c48f8645-4302-4308-8dfe-60f4e4c9561d","teamID":"8b030b29-cba5-4946-b7ca-1272d9b0fd51","lives":3,"__v":0},{"_id":"642b088c321b61d5db5de37d","name":"Va","id":"ff10c867-c21a-4fef-bcdf-0e2cb3c0c1a3","teamID":"d61baa6a-1950-471d-8468-975e11bfd7b1","lives":3,"__v":0},{"_id":"642b088c321b61d5db5de67p","name":"Charlotte","id":"ff10c867-c21a-4fef-bcdf-0e2cb3c0c2zr","teamID":"d61baa6a-1950-471d-8468-975e11bfd7b1","lives":3,"__v":0}],"settings":{"_id":"642b0827321b61d5db5de34a","maximumLives":3,"__v":0},"teams":[{"_id":"642b08b1321b61d5db5de3a1","name":"AAAA","id":"d61baa6a-1950-471d-8468-975e11bfd7b1","createdAt":"2023-04-03T17:11:13.742Z","__v":0},{"_id":"642b08b5321b61d5db5de3a6","name":"222é","id":"8b030b29-cba5-4946-b7ca-1272d9b0fd51","createdAt":"2023-04-03T17:11:17.244Z","__v":0}]};
  // const row = game.players.map((player) => {return {...player, teamName: game.teams?.find((team) => team.id === player.teamID)?.name || ''}});
  
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '400px', width: '100%' }), []);
    const [rowData, setRowData] = useState(gameSetting.players);
    const [columnDefs, setColumnDefs] = useState([
      { field: 'name', rowDrag: true },
      { field: 'id', hide: true },
      { field: 'lives' },

    ]);
    const defaultColDef = useMemo(() => {
      return {
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
      };
    }, []);
  
    const onGridReady = useCallback((params) => {
      addDropZones(params);
      addCheckboxListener(params);
    }, []);

    const addCheckboxListener = (params) => {
      var checkbox = document.querySelector('input[type=checkbox]');
      checkbox.addEventListener('change', function () {
        params.api.setSuppressMoveWhenRowDragging(checkbox.checked);
      });
    };

    const [teamPlayers, setTeamPlayers] = useState([]);
    
    const addDropZones = (params) => {
      gameSetting.teams.forEach((team) => {
        var tileContainer = document.querySelector(`.team-${team.id}`);
        var dropZone = {
          getContainer: () => {
            return tileContainer;
          },
          onDragStop: (params) => {
            setTeamPlayers(oldArray => {
              const exist = oldArray.find( (teamPlayer) => teamPlayer.player.id == params.node.data.id && teamPlayer.teamID == team.id );
              if(!exist){
                return [...oldArray, {teamID: team.id, player: {name: params.node.data.name, id: params.node.data.id, lives: params.node.data.lives}}]
              }else{
                return [...oldArray]
              }
            })
          },
        };
        params.api.addRowDropZone(dropZone);
      })
    };
   /*****************************************************************************************************/

  return (
    <div>
      <img src="logo.png" className={ style.logo } /> { selectedTeam }
      <div>
        <Settings />

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
      {/* { teams.map( ( team ) => (
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
                    setEditingTeam( '' );
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
      ) ) } */}

      <form onSubmit={ handleSubmit }>
        <br />

        <TextField size="small" value={ name } onChange={ ( e ) => setName( e.target.value ) } id="outlined-basic" label="Prénom" variant="outlined" />

        <Button type="submit" variant="outlined">Ajouter un joueur</Button>
      </form>

      <div className="drop-containers">
        <div className="grid-wrapper">
          <div style={gridStyle} className="ag-theme-alpine">
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowDragManaged={true}
              animateRows={true}
              onGridReady={onGridReady}
            ></AgGridReact>
          </div>
        </div>
        <div className='drop-wrapper'>
        {gameSetting.teams.map((team) => (
          <Team id={team.id} teamPlayers={teamPlayers} />
        ))}
        </div>
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
