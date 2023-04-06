import React, { useState, useEffect } from 'react';
import { Button, IconButton, TextField, Alert } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Edit as EditIcon, DeleteForever as DeleteForeverIcon, Settings as SettingsIcon } from '@mui/icons-material';
import * as API from './api';
import socket from './socket';
import style from "./styles.module.scss";
import { deepEqual } from './utils';

export const Player = React.memo(
    ({ id }) => {
        //player: { id: string, teamID: string, name: string, lives: number }
        const [player, setPlayer] = useState();
        const [settings, setSettings] = useState();
        const [loading, setLoading] = useState(false);
        const [editing, setEditing] = useState(false);
        const [editingName, setEditingName] = useState("");
        const [message, setMessage] = useState("");

        const getPlayer = async () => {
            const playerFromApi = await API.getPlayer(id);
            if (playerFromApi && playerFromApi?.name) {
                console.log('REACT/ fetching one player', playerFromApi)
                setPlayer(playerFromApi);
                setEditingName(playerFromApi.name);
                // setLoading(false);
            }
        };

        const getSettings = async () => {
            const gameSettings = await API.fetchGameSettings();
            if (gameSettings) {
                console.log('REACT/ fetching settings', gameSettings)
                setSettings(gameSettings);
            }
        };

        const handlePlayerUpdated = (data) => {
            const playerFromSocket = data;
            // if (playerFromSocket !== player) {
            if (playerFromSocket.id == id && !deepEqual(playerFromSocket, player)) {
                // setLoading(true);
                getPlayer();
            }
            // }
        };

        const handleLivesUpdated = (data) => {
            if(Array.isArray(data)){
                const playersFromSocket = data;
                const playerToUpdate = playersFromSocket.find((p) => p.id == id);
                if (playerToUpdate && !deepEqual(playerToUpdate, player)) {
                    setPlayer({ ...player, lives: playerToUpdate.lives });
                }
            }else if(data?.id){
                const playerFromSocket = data;
                console.log("playerFromSocket ",playerFromSocket)
                setPlayer({ ...player, lives: playerFromSocket.lives });
            }
        };

        useEffect(() => {
            getPlayer();
            getSettings();
            socket.on("playerUpdated", handlePlayerUpdated);
            socket.on('livesUpdated', handleLivesUpdated);
            return () => {
                socket.off('playerUpdated', handlePlayerUpdated);
                socket.off('livesUpdated', handleLivesUpdated);
            };
        }, []);

        useEffect(() => {
            if (!loading) {
                // setLoading(true);
                getPlayer();
            }
        }, [loading]);

        const handleRemovePlayer = async () => {
            console.log("REACT/handleRemovePlayer", { id });
            setLoading(true);
            const removedid = await API.removePlayer(id);
            if (removedid) {
                setLoading(false);
                socket.emit('clientPlayerRemoved', id);
                console.log("REACT/handleRemovePlayer complete");
            }
        };

        const handleRemoveLife = async () => {
            console.log("REACT/handleRemoveLife", { id });
            setLoading(true);
            // const player = players.find((p) => p.id === id);

            // if (player && player.lives <= 0) {
            //     console.log("min reached");
            //     return;
            // }

            const updatedPlayer = await API.removeLife(id);
            if (updatedPlayer) {
                setLoading(false);
                socket.emit("clientLivesUpdate", updatedPlayer);
                console.log("REACT/handleRemoveLife complete");
            }
        };

        const handleAddLife = async () => {
            console.log("REACT/handleAddLife", { id });
            setLoading(true);
            // const player = players.find((p) => p.id === id);

            // if (player && player.lives >= settings.maximumLives) {
            //     console.log("max reached");
            //     return;
            // }

            const updatedPlayer = await API.addLife(id);
            if (updatedPlayer) {
                setLoading(false);
                socket.emit("clientLivesUpdate", updatedPlayer);
            }
        };

        const handleEditSubmit = async (e) => {
            e.preventDefault();
            if (!editingName) return;
            setLoading(true);
            const updatedPlayer = await API.editPlayer({ ...player, name: editingName });
            if (updatedPlayer) {
                setEditingName(editingName);
                setEditing(false);
                setLoading(false);
                socket.emit('playerUpdated', updatedPlayer);
            }
        };

        return (
            <li className={style.list} key={id}>
                <div className={style.userActions}>
                    <IconButton
                        color="secondary"
                        aria-label="edit"
                        onClick={() => {
                            setEditing(true);
                        }}
                        disabled={loading}
                    >
                        <EditIcon />
                    </IconButton>

                    <IconButton onClick={() => handleRemovePlayer()} disabled={loading} color="secondary" aria-label="add an alarm">
                        <DeleteForeverIcon />
                    </IconButton>
                    <IconButton onClick={() => handleRemoveLife()} disabled={loading} color="secondary" aria-label="add an alarm">
                        <RemoveIcon />
                    </IconButton>
                    <IconButton onClick={() => handleAddLife()} disabled={loading} color="secondary" aria-label="add an alarm">
                        <AddIcon />
                    </IconButton>
                </div>
                {!!player && player?.name && player.lives.length !== 0 && (
                    <span>
                        {Array(player.lives)
                            .fill()
                            .map((_, index) => (
                                <img src="laugh.png" alt="emoji" className={style.emoji} key={index} />
                            ))}
                        {!!settings && settings?.maximumLives && (
                            <span style={{ opacity: 0.3 }}>
                                {settings.maximumLives - player.lives > 0
                                    ? Array(settings.maximumLives - player.lives)
                                        .fill()
                                        .map((_, index) => (
                                            <img src="laugh.png" alt="emoji" className={style.emoji} key={index} />
                                        ))
                                    : ""}
                            </span>
                        )}

                        <span className={player.lives == 0 ? style.dead : style.username}>
                            {editing ? (
                                <form onSubmit={(e) => handleEditSubmit(e)}>
                                    <TextField
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        name="playerName"
                                        size="small"
                                        autoFocus
                                    />

                                    {/* <FormControl variant="outlined" size="small">
                                        <InputLabel htmlFor="team-selector">Équipe</InputLabel>
                                        <Select
                                            native
                                            value={selectedTeam}
                                            onChange={(e) => setSelectedTeam(e.target.value)}
                                            label="Équipe"
                                            inputProps={{
                                                name: 'team',
                                                id: 'team-selector',
                                            }}
                                            style={{ minWidth: '150px', marginLeft: '10px' }}
                                        >
                                            <option aria-label="None" value="" />
                                            {teams.map((team) => (
                                                <option key={team.id} value={team.id}>{team.name}</option>
                                            ))}
                                        </Select>
                                    </FormControl> */}

                                    <Button type="submit" disabled={loading} variant="outlined">
                                        Modifier
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setEditing(false);
                                        }}
                                    >
                                        Annuler
                                    </Button>
                                </form>
                            ) : (
                                <div>
                                    {player.name}
                                    {/* {player?.teamID && teams.find((team) => team.id === player?.teamID)?.name} */}
                                </div>

                            )}
                        </span>
                        {!!message && (<Alert severity="warning">{message}</Alert>)}

                    </span>
                )}

            </li>
        )
    }
);