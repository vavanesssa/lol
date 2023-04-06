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
import { PlayerList } from './PlayerList';
import { deepEqual } from './utils';

const Admin = () => {
  // { players: [{_id: string, name: string, id: string, teamID: string, lives: number, __v: number}], 
  // settings: { _id: string, maximumLives: number, __v: number },
  // teams: [{ _id: string, name: string, id: string, createdAt: string, __v: number }] }
  const [game, setGame] = useState();
  const [newTeamName, setNewTeamName] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  // const [searchQuery, setSearchQuery] = useState("");
  // const theme = useTheme();

  const getGame = async () => {
    const gaming = await API.getGame();
    if (gaming && !deepEqual(gaming, game)) {
      console.log('REACT/ fetching gaming', gaming)
      setGame(gaming);
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
  // const handleTeamUpdated = () => {
  //   getGame();
  // };

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
    socket.on('teamAdded', handleTeamAdded);
    socket.on('teamRemoved', handleTeamRemoved);
    socket.on('updateSettings', handleUpdateSettings);

    return () => {
      socket.disconnect();
      socket.off('teamAdded', handleTeamAdded);
      socket.off('teamRemoved', handleTeamRemoved);
      socket.off('updateSettings', handleUpdateSettings);
    };
  }, []);

  const handleAddPlayerSubmit = async (e) => {
    console.log("REACT/handleAddPlayerSubmit", { newPlayerName });
    e.preventDefault();
    const newPlayer = await API.addPlayer(newPlayerName, game.settings.maximumLives);
    if (newPlayer) {
      setNewPlayerName('');
      socket.emit('playerAdded', newPlayer);
      console.log("REACT/handleAddPlayerSubmit complete");
    }
  };

  const handleAddTeamSubmit = async (e) => {
    console.log("REACT/handleTeamSubmit", { newTeamName });
    e.preventDefault();
    const newTeam = await API.addTeam(newTeamName);
    if (newTeam) {
      setNewTeamName('');
      socket.emit('teamAdded', newTeam);
      console.log("REACT/handleTeamSubmit complete");
    }
  };

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
        <PlayerList />
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
