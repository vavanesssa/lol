import React, { useState, useEffect } from 'react';
import { IconButton, Button, TextField, Alert } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Edit as EditIcon, DeleteForever as DeleteForeverIcon, Settings as SettingsIcon } from '@mui/icons-material';
import * as API from './api';
import socket from './socket';
import { Player } from './Player';
import { deepEqual } from './utils';

export const Team = React.memo(
    ({ id }) => {
        //team : {id: string, name: string, players: [{ id: string }]}
        const [team, setTeam] = useState({ _id: "642b08b1321b61d5db5de3a1", name: "AAAA", id: "d61baa6a-1950-471d-8468-975e11bfd7b1", players: [{ _id: "642b0885321b61d5db5de379", name: "Lucie", id: "c48f8645-4302-4308-8dfe-60f4e4c9561d", teamID: "8b030b29-cba5-4946-b7ca-1272d9b0fd51", lives: 3, __v: 0 }], createdAt: "2023-04-03T17:11:13.742Z", __v: 0 });
        const [loading, setLoading] = useState(false);
        const [editing, setEditing] = useState(false);
        const [editingName, setEditingName] = useState("");
        const [message, setMessage] = useState("");

        const getTeam = async () => {
            const teamFromApi = await API.getTeam(id);
            if (teamFromApi && teamFromApi.success && teamFromApi?.name) {
                console.log('REACT/ fetching one team', teamFromApi);
                setTeam(teamFromApi);
                setEditingName(teamFromApi.name);
                // setLoading(false);
            }
        };

        const handleTeamUpdated = (data) => {
            const teamFromSocket = JSON.parse(data);
            // if (teamFromSocket !== team) {
            if (teamFromSocket.id == id && !deepEqual(teamFromSocket, team)) {
                // setLoading(true);
                getTeam();
            }
            // 
        };

        useEffect(() => {
            getTeam();
            socket.on("teamUpdated", handleTeamUpdated);
            return () => {
                socket.off('teamUpdated', handleTeamUpdated);
            };
        }, []);

        useEffect(() => {
            if (!loading) {
                // setLoading(true);
                getTeam();
            }
        }, [loading]);

        const handleRemoveTeam = async () => {
            console.log("REACT/handleRemoveTeam", { id });
            const response = await API.removeTeam(id);
            if (response.success) {
                setLoading(false);
                socket.emit('teamRemoved', id);
                console.log("REACT/handleRemoveTeam complete");
            }
        };

        const handleRemoveOneLifeTeamPlayer = async () => {
            // console.log("REACT/handleRemoveOneLifeTeamPlayer", { id });
            // setLoading(true);
            // const player = players.find((p) => p.id === id);

            // if (player && player.lives <= 0) {
            //     console.log("min reached");
            //     return;
            // }

            // const updatedPlayer = await API.removeLife(id);
            // if (updatedPlayer.success) {
            //     setLoading(false);
            //     socket.emit("clientLivesUpdate", updatedPlayer);
            //     console.log("REACT/handleRemoveOneLifeTeamPlayer complete");
            // }
        };

        const handleAddOneLifeTeamPlayer = async () => {
            // console.log("REACT/handleAddOneLifeTeamPlayer", { id });
            // setLoading(true);
            // const player = players.find((p) => p.id === id);

            // if (player && player.lives >= maximumLives) {
            //     console.log("max reached");
            //     return;
            // }

            // const updatedPlayer = await API.addLife(id);
            // if (updatedPlayer.success) {
            //     setLoading(false);
            //     socket.emit("clientLivesUpdate", updatedPlayer);
            // }
        };

        const handleEditSubmit = async (e) => {
            e.preventDefault();
            if (!editingName) return;
            setLoading(true);
            const updatedTeam = await API.editTeam({ ...team, name: editingName });
            if (updatedTeam.success) {
                setEditingName(editingName);
                setEditing(false);
                setLoading(false);
                socket.emit('teamUpdated', updatedTeam);
            }
        };

        return (
            <div key={id} className="drop-col">
                {!!team && team?.name && (
                    <React.Fragment>
                        <div id="eDropTarget" className="drop-target">
                            {editing ? (
                                <form onSubmit={(e) => handleEditSubmit(e)}>
                                    <TextField
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        name="playerName"
                                        size="small"
                                        autoFocus
                                    />

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
                                <span>
                                    Equipe: {team.name}
                                </span>
                            )}
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
                            <IconButton onClick={() => handleRemoveTeam()} disabled={loading} color="secondary" aria-label="add an alarm">
                                <DeleteForeverIcon />
                            </IconButton>
                            <IconButton onClick={() => handleRemoveOneLifeTeamPlayer()} disabled={loading} color="secondary" aria-label="add an alarm">
                                <RemoveIcon />
                            </IconButton>
                            <IconButton onClick={() => handleAddOneLifeTeamPlayer()} disabled={loading} color="secondary" aria-label="add an alarm">
                                <AddIcon />
                            </IconButton>
                        </div>
                        <div className={`team-${id}`}>
                            {team?.players && !!team.players.length && team.players.map((player) => {
                                return <Player id={player.id} />;
                            })}
                        </div>
                    </React.Fragment>
                )}
                {!!message && (<Alert severity="warning">{message}</Alert>)}
            </div>
        )
    }
);