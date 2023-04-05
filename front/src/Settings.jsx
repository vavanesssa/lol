import React, { useEffect, useState } from 'react';
import { addPlayer, getPlayers, addLife, fetchGameSettings, updateGameSettings, resetLives, removePlayer, removeLife, editPlayer, addTeam, getTeams, editTeam, removeTeam } from './api';
import socket from './socket';
import { Button, Box, IconButton, TextField, Slider, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Edit as EditIcon, DeleteForever as DeleteForeverIcon, Settings as SettingsIcon } from '@mui/icons-material';
import style from "./styles.module.scss";
import useMediaQuery from '@mui/material/useMediaQuery';

const Settings = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery( theme.breakpoints.down( 'md' ) );
  const [ open, setOpen ] = React.useState( false );
  const [ maximumLives, setMaximumLives ] = useState( 0 );
  const handleClickOpen = () => {
    setOpen( true );
  };

  const handleClose = () => {
    setOpen( false );
  };

  const fetchGameSettingsData = async () => {
    console.log( 'REACT/ fetching game settings' );
    const settings = await fetchGameSettings();
    if(settings){
      setMaximumLives( settings.maximumLives );
    }
  };

  const updateGameSettingsData = async () => {
    await updateGameSettings( maximumLives );
  };

  const resetLivesData = async () => {
    const updatedPlayers = await resetLives( maximumLives );
    handleClose()
  };

  useEffect( () => {
    fetchGameSettingsData();
  }, [] );

  return (
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
    </div>
  )
}

export default Settings