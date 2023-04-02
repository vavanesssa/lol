import React, { useEffect, useState } from 'react';
import { addPlayer, getPlayers, addLife, fetchGameSettings, updateGameSettings, resetLives, removePlayer, removeLife, editPlayer, addTeam, getTeams, editTeam, removeTeam } from './api';

import socket from './socket';

import { Button, Box, IconButton, TextField, Slider, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Edit as EditIcon, DeleteForever as DeleteForeverIcon, Settings as SettingsIcon } from '@mui/icons-material';
import style from "./styles.module.scss";
import useMediaQuery from '@mui/material/useMediaQuery';

const Player = ( { player, handleEditSubmit, setEditingName } ) => {
  console.log( 'REACT/ rendering player', player );
  return (
    <div>
      <li className={ style.list } key={ player.id }>
        {/* <div className={ style.userActions }>
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
        </div> */}
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
    </div>
  )
}

export default Player