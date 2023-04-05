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
import { deepEqual } from './utils';

const Admin = () => {
  // { players: [{_id: string, name: string, id: string, teamID: string, lives: number, __v: number}], 
  // settings: { _id: string, maximumLives: number, __v: number },
  // teams: [{ _id: string, name: string, id: string, createdAt: string, __v: number }] }
  const [game, setGame] = useState();
  const [newTeamName, setNewTeamName] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(false);
  // const [searchQuery, setSearchQuery] = useState("");
  // const theme = useTheme();

  const getGame = async () => {
    const gaming = await API.getGame();
    if (gaming && !deepEqual(gaming, game)) {
      console.log('REACT/ fetching gaming', gaming)
      setGame(gaming);
      // setLoading(false);
    }
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

  const handlePlayerUpdated = () => {
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
    getGame();

    socket.on('playerAdded', handlePlayerAdded);
    socket.on('playerRemoved', handlePlayerRemoved);
    socket.on("playerUpdated", handlePlayerUpdated);
    socket.on('playersReset', handlePlayersReset);
    socket.on('teamAdded', handleTeamAdded);
    socket.on('teamRemoved', handleTeamRemoved);
    socket.on('updateSettings', handleUpdateSettings);

    return () => {
      socket.disconnect();

      socket.off('playerAdded', handlePlayerAdded);
      socket.off('playerRemoved', handlePlayerRemoved);
      socket.on("playerUpdated", handlePlayerUpdated);
      socket.off('playersReset', handlePlayersReset);
      socket.off('teamAdded', handleTeamAdded);
      socket.off('teamRemoved', handleTeamRemoved);
      socket.off('updateSettings', handleUpdateSettings);
    };
  }, []);

  // useEffect(() => {
  //   if (!loading) {
  //       // setLoading(true);
  //       getGame();
  //   }
  // }, [loading]);

  const handleAddPlayerSubmit = async (e) => {
    console.log("REACT/handleAddPlayerSubmit", { newPlayerName });
    e.preventDefault();
    setLoading(true);
    const newPlayer = await API.addPlayer(newPlayerName, game.settings.maximumLives);
    if (newPlayer) {
      setNewPlayerName('');
      socket.emit('playerAdded', newPlayer);
      setLoading(false);
      console.log("REACT/handleAddPlayerSubmit complete");
    }
  };

  const handleAddTeamSubmit = async (e) => {
    console.log("REACT/handleTeamSubmit", { newTeamName });
    e.preventDefault();
    setLoading(true);
    const newTeam = await API.addTeam(newTeamName);
    if (newTeam) {
      setNewTeamName('');
      socket.emit('teamAdded', newTeam);
      setLoading(false);
      console.log("REACT/handleTeamSubmit complete");
    }
  };

  const handleAddPlayerTeam = async (team, playerID) => {
    console.log("REACT/handleAddPlayerTeam", { newTeamName });
    const updatedTeam = await API.editTeam({ ...team, playersInTeam: [...team.playersInTeam, playerID] });
    if (updatedTeam) {
      socket.emit('teamUpdated', updatedTeam);
    }
  };

  /****************AG-GRID****************************************************************************/
  // const gameSetting = { "players": [{ "_id": "642b0885321b61d5db5de379", "name": "Lucie", "id": "c48f8645-4302-4308-8dfe-60f4e4c9561d", "teamID": "8b030b29-cba5-4946-b7ca-1272d9b0fd51", "lives": 3, "__v": 0 }, { "_id": "642b088c321b61d5db5de37d", "name": "Va", "id": "ff10c867-c21a-4fef-bcdf-0e2cb3c0c1a3", "teamID": "d61baa6a-1950-471d-8468-975e11bfd7b1", "lives": 3, "__v": 0 }, { "_id": "642b088c321b61d5db5de67p", "name": "Charlotte", "id": "ff10c867-c21a-4fef-bcdf-0e2cb3c0c2zr", "teamID": "d61baa6a-1950-471d-8468-975e11bfd7b1", "lives": 3, "__v": 0 }], "settings": { "_id": "642b0827321b61d5db5de34a", "maximumLives": 3, "__v": 0 }, "teams": [{ "_id": "642b08b1321b61d5db5de3a1", "name": "AAAA", "id": "d61baa6a-1950-471d-8468-975e11bfd7b1", "createdAt": "2023-04-03T17:11:13.742Z", "__v": 0 }, { "_id": "642b08b5321b61d5db5de3a6", "name": "222é", "id": "8b030b29-cba5-4946-b7ca-1272d9b0fd51", "createdAt": "2023-04-03T17:11:17.244Z", "__v": 0 }] };
  // const row = game.players.map((player) => {return {...player, teamName: game.teams?.find((team) => team.id === player.teamID)?.name || ''}});

  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '400px', width: '100%' }), []);
  const [rowData, setRowData] = useState();
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

  useEffect(() => {
    if (game && game?.players) {
      setRowData(game.players);
    }
  }, [game]);

  const onGridReady = useCallback((params) => {
    addDropZones(params.api);
    addCheckboxListener(params);
  }, []);

  const onRowDataUpdated = (event) => {
    addDropZones(event.api);
  };

  const addCheckboxListener = (params) => {
    var checkbox = document.querySelector('input[type=checkbox]');
    checkbox.addEventListener('change', function () {
      params.api.setSuppressMoveWhenRowDragging(checkbox.checked);
    });
  };

  const addDropZones = (api) => {
    game && game?.teams && !!game.teams.length && game.teams.forEach((team) => {
      var tileContainer = document.querySelector(`.team-${team.id}`);
      var dropZone = {
        getContainer: () => {
          return tileContainer;
        },
        onDragStop: (params) => {
          console.log("onDragStop ", team, params?.node?.data?.id)
          const exist = team.playersInTeam.find((id) => id == params.node.data.id);
          if (!exist) {
            handleAddPlayerTeam(team, params.node.data.id);
          }
        },
      };
      api.addRowDropZone(dropZone);
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
              onRowDataUpdated={onRowDataUpdated}
            ></AgGridReact>
          </div>
        </div>
        <div className='drop-wrapper'>
          {game && game?.teams && !!game.teams.length && game.teams.map((team) => (
            <Team id={team.id} />
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
