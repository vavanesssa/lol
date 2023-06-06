// AppContext.js
import React, { createContext, useContext, useState } from 'react';
import * as API from './api';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const AppContext = createContext();

export const useAppContext = () => useContext( AppContext );

export const AppProvider = ( { children } ) => {
  const [ teamName, setTeamName ] = useState( '' );
  const [ teams, setTeams ] = useState( [] );
  const [ editingTeam, setEditingTeam ] = useState( '' );
  const [ editingTeamName, setEditingTeamName ] = useState( '' );
  const [ editingPlayer, setEditingPlayer ] = useState( '' );
  const [ editingName, setEditingName ] = useState( "" );
  const [ selectedTeam, setSelectedTeam ] = useState( '' );
  const [ players, setPlayers ] = useState( [] );
  const [ name, setName ] = useState( '' );
  const [ maximumLives, setMaximumLives ] = useState( 0 );
  const [ searchQuery, setSearchQuery ] = useState( "" );
  const theme = useTheme();
  const isSmallScreen = useMediaQuery( theme.breakpoints.down( 'sm' ) );

  const fetchGameSettings = async () => {
    const settings = await API.fetchGameSettings();
    setMaximumLives( settings.maximumLives );
  };

  const fetchTeams = async () => {
    const teams = await API.getTeams();
    setTeams( teams );
  };

  const fetchPlayers = async () => {
    const players = await API.getPlayers();
    setPlayers( players );
  };

  const fetchAllData = () => {
    fetchGameSettings();
    fetchTeams();
    fetchPlayers();
  };

  return (
    <AppContext.Provider
      value={ {
        teamName,
        setTeamName,
        teams,
        setTeams,
        editingTeam,
        setEditingTeam,
        editingTeamName,
        setEditingTeamName,
        editingPlayer,
        setEditingPlayer,
        editingName,
        setEditingName,
        selectedTeam,
        setSelectedTeam,
        players,
        setPlayers,
        name,
        setName,
        maximumLives,
        setMaximumLives,
        searchQuery,
        setSearchQuery,
        isSmallScreen,
        fetchAllData
      } }
    >
      { children }
    </AppContext.Provider>
  );
};
