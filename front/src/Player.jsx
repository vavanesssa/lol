import React, { useState, useEffect } from 'react';
import { Button, IconButton, TextField } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Edit as EditIcon, DeleteForever as DeleteForeverIcon, Settings as SettingsIcon } from '@mui/icons-material';
import * as API from './api';
import socket from './socket';
import style from "./styles.module.scss";

export const Player = React.memo(
    ({ id }) => {
        const [player, setPlayer] = useState();
        const [loading, setLoading] = useState(false);
        const [editing, setEditing] = useState(false);
        const [editingName, setEditingName] = useState("");

        const getPlayer = async () => {
            const player = await API.getPlayer(id);
            console.log('REACT/ fetching one player', player)
            setPlayer(player);
        };

        const handlePlayerUpdated = (data) => {
            const playerFromSocket = JSON.parse(data);
            // if (playerFromSocket !== player) {
                if(playerFromSocket.id == id){
                    getPlayer();
                }
            // }
        };

        const handleLivesUpdated = (data) => {
            const playerFromSocket = JSON.parse(data);
            // if (playerFromSocket !== player) {
                if(playerFromSocket.id == id){
                    getPlayer();
                }
            // }
        };

        useEffect(() => {
            getPlayer();
            socket.on("playerUpdated", handlePlayerUpdated);
            socket.on( 'livesUpdated', handleLivesUpdated);
            return () => {
                socket.off('playerUpdated', handlePlayerUpdated);
                socket.off( 'livesUpdated', handleLivesUpdated);
            };
        }, []);

        useEffect(() => {
            if (!loading) {
                getPlayer();
            }
        }, [loading]);

        const handleRemovePlayer = async () => {
            console.log("REACT/handleRemovePlayer", { id });
            setLoading(true);
            const removedid = await API.removePlayer(id);
            if (removedid.success) {
                setLoading(false);
                socket.emit('clientPlayerRemoved', id);
                console.log("REACT/handleRemovePlayer complete");
            }
        };

        const handleRemoveLife = async () => {
            console.log("REACT/handleRemoveLife", { id });
            setLoading(true);
            const player = players.find((p) => p.id === id);

            if (player && player.lives <= 0) {
                console.log("min reached");
                return;
            }

            const updatedPlayer = await API.removeLife(id);
            if (updatedPlayer.success) {
                setLoading(false);
                socket.emit("clientLivesUpdate", updatedPlayer);
                console.log("REACT/handleRemoveLife complete");
            }
        };

        const handleAddLife = async () => {
            console.log("REACT/handleAddLife", { id });
            setLoading(true);
            const player = players.find((p) => p.id === id);

            if (player && player.lives >= maximumLives) {
                console.log("max reached");
                return;
            }

            const updatedPlayer = await API.addLife(id);
            if (updatedPlayer.success) {
                setLoading(false);
                socket.emit("clientLivesUpdate", updatedPlayer);
            }
        };

        const handleEditSubmit = async (e) => {
            e.preventDefault();
            if (!editingName) return;
            setLoading(true);
            const updatedPlayer = await API.editPlayer(id, editingName, player.teamID);
            if (updatedPlayer.success) {
                setEditingName(editingName);
                setEditing(false);
                setLoading(false);
                socket.emit( 'playerUpdated', updatedPlayer );
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
                    >
                        <EditIcon />
                    </IconButton>

                    <IconButton onClick={() => handleRemovePlayer()} color="secondary" aria-label="add an alarm">
                        <DeleteForeverIcon />
                    </IconButton>
                    <IconButton onClick={() => handleRemoveLife()} color="secondary" aria-label="add an alarm">
                        <RemoveIcon />
                    </IconButton>
                    <IconButton onClick={() => handleAddLife()} color="secondary" aria-label="add an alarm">
                        <AddIcon />
                    </IconButton>
                </div>
                {!!player && player?.name && player?.lives && player?.teamID && (
                    <span>
                        {Array(player.lives)
                            .fill()
                            .map((_, index) => (
                                <img src="laugh.png" alt="emoji" className={style.emoji} key={index} />
                            ))}
                        <span style={{ opacity: 0.3 }}>
                            {maximumLives - player.lives > 0
                                ? Array(maximumLives - player.lives)
                                    .fill()
                                    .map((_, index) => (
                                        <img src="laugh.png" alt="emoji" className={style.emoji} key={index} />
                                    ))
                                : ""}
                        </span>

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

                                    <Button type="submit" variant="outlined">
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
                                    {player.name} {player.teamID && teams.find((team) => team.id === player.teamID)?.name}
                                </div>

                            )}
                        </span>

                    </span>
                )}

            </li>
        )
    }
);