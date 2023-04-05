import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as API from './api';
import socket from './socket';
import { Button, Box, IconButton, TextField, Slider, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Edit as EditIcon, DeleteForever as DeleteForeverIcon, Settings as SettingsIcon } from '@mui/icons-material';
import style from "./styles.module.scss";
import useMediaQuery from '@mui/material/useMediaQuery';
import Settings from './Settings';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './style.css';
import { Team } from './Team';

const Admin = () => {
  const [game, setGame] = useState();
  const [newTeamName, setNewTeamName] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [maximumLives, setMaximumLives] = useState(0);
  // const [selectedTeam, setSelectedTeam] = useState('');
  // const [searchQuery, setSearchQuery] = useState("");
  // const theme = useTheme();

  const getGame = async () => {
    const game = await API.getGame();
    console.log('REACT/ fetching gaming', game)
    setGame(game);
  };

  // const fetchAllData = () => {
  //   fetchGameSettings(),
  //     fetchTeams(),
  //     fetchPlayers(),
  //     console.log("REACT/fetchAllData complete");
  // };

  // const filteredPlayers = players.filter((player) => {
  //   const fullName = `${player.name}`.toLowerCase();
  //   return fullName.includes(searchQuery.toLowerCase());
  // });

  // useEffect(() => {
  //   fetchGaming();
  //   fetchGameSettings();
  //   fetchTeams();
  //   fetchPlayers();
  //   setInterval(() => {
  //     fetchPlayers()
  //   }, 10000);
  // }, []);

  const handlePlayerAdded = () => {
    getGame();
  };

  const handlePlayerRemoved = () => {
    getGame();
  };

  const handlePlayersReset = () => {
    getGame();
  };

  const handleTeamAdded = () => {
    getGame();
  };

  const handleTeamRemoved = () => {
    getGame();
  };

  const handleUpdateSettings = () => {
    getGame();
  };

  useEffect(() => {
    socket.connect();

    socket.on('playerAdded', handlePlayerAdded);
    socket.on('playerRemoved', handlePlayerRemoved);
    socket.on('playersReset', handlePlayersReset);
    socket.on('teamAdded', handleTeamAdded);
    socket.on('teamRemoved', handleTeamRemoved);
    socket.on('updateSettings', handleUpdateSettings);

    return () => {
      socket.disconnect();

      socket.off('playerAdded', handlePlayerAdded);
      socket.off('playerRemoved', handlePlayerRemoved);
      socket.off('playersReset', handlePlayersReset);
      socket.off('teamAdded', handleTeamAdded);
      socket.off('teamRemoved', handleTeamRemoved);
      socket.off('updateSettings', handleUpdateSettings);
    };
  }, []);

  const handleAddPlayerSubmit = async (e) => {
    //id devrait être générer côté backend
    const id = "";
    console.log("REACT/handleAddPlayerSubmit", { newPlayerName, id, maximumLives });
    e.preventDefault();
    const newPlayer = await API.addPlayer(newPlayerName, id, maximumLives);
    if (newPlayer.success) {
      setNewPlayerName('');
      socket.emit( 'playerAdded', newPlayer );
      console.log("REACT/handleAddPlayerSubmit complete");
    }
  };

  const handleAddTeamSubmit = async (e) => {
    console.log("REACT/handleTeamSubmit", { newTeamName });
    e.preventDefault();
    const newTeam = await API.addTeam(newTeamName);
    if(newTeam.success){
      setNewTeamName('');
      socket.emit('teamAdded', newTeam);
      console.log("REACT/handleTeamSubmit complete");
    }
  };

  /****************AG-GRID****************************************************************************/
  const gameSetting = { "players": [{ "_id": "642b0885321b61d5db5de379", "name": "Lucie", "id": "c48f8645-4302-4308-8dfe-60f4e4c9561d", "teamID": "8b030b29-cba5-4946-b7ca-1272d9b0fd51", "lives": 3, "__v": 0 }, { "_id": "642b088c321b61d5db5de37d", "name": "Va", "id": "ff10c867-c21a-4fef-bcdf-0e2cb3c0c1a3", "teamID": "d61baa6a-1950-471d-8468-975e11bfd7b1", "lives": 3, "__v": 0 }, { "_id": "642b088c321b61d5db5de67p", "name": "Charlotte", "id": "ff10c867-c21a-4fef-bcdf-0e2cb3c0c2zr", "teamID": "d61baa6a-1950-471d-8468-975e11bfd7b1", "lives": 3, "__v": 0 }], "settings": { "_id": "642b0827321b61d5db5de34a", "maximumLives": 3, "__v": 0 }, "teams": [{ "_id": "642b08b1321b61d5db5de3a1", "name": "AAAA", "id": "d61baa6a-1950-471d-8468-975e11bfd7b1", "createdAt": "2023-04-03T17:11:13.742Z", "__v": 0 }, { "_id": "642b08b5321b61d5db5de3a6", "name": "222é", "id": "8b030b29-cba5-4946-b7ca-1272d9b0fd51", "createdAt": "2023-04-03T17:11:17.244Z", "__v": 0 }] };
  const row = game.players.map((player) => {return {...player, teamName: game.teams?.find((team) => team.id === player.teamID)?.name || ''}});

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
            const exist = oldArray.find((teamPlayer) => teamPlayer.player.id == params.node.data.id && teamPlayer.teamID == team.id);
            if (!exist) {
              return [...oldArray, { teamID: team.id, player: { name: params.node.data.name, id: params.node.data.id, lives: params.node.data.lives } }]
            } else {
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
      <img src="logo.png" className={style.logo} /> {selectedTeam}
      <div>
        <Settings />
        <br />
      </div>

      <form onSubmit={handleAddPlayerSubmit}>
        <br />
        <TextField
          size="small"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          id="outlined-basic"
          label="Prénom"
          variant="outlined"
        />
        <Button type="submit" variant="outlined">
          Ajouter un joueur
        </Button>
      </form>

      <form onSubmit={handleAddTeamSubmit}>
        <TextField
          size="small"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          id="outlined-basic"
          label="Nom de l'équipe"
          variant="outlined"
        />
        <Button type="submit" variant="outlined">
          Ajouter une équipe
        </Button>
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

      {/* <label>
        <br />
        <TextField value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher..." label="Rechercher" variant="outlined" />

      </label>
      <ul className={style.listwrapper}>
        {filteredPlayers.map((player) => (
          <PlayerItem player={player} />
        ))}
      </ul> */}

    </div>
  );
};

export default Admin;
