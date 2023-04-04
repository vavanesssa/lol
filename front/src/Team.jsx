import React, { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import * as API from './api';
import socket from './socket';
import { Player } from './Player';

export const Team = React.memo(
    ({ id, teamPlayers }) => {
        const [team, setTeam] = useState();
        const [loading, setLoading] = useState(false);
        const [editing, setEditing] = useState(false);
        const [editingName, setEditingName] = useState("");

        const getTeam = async () => {
            const team = await API.getTeam(id);
            console.log('REACT/ fetching one team', team)
            setTeam(team);
        };

        useEffect(() => {
            getTeam();
            socket.on("updated team", (data) => {
                const teamFromSocket = JSON.parse(data);
                if (teamFromSocket !== team) {
                    getTeam();
                }
            });
            return () => {
                socket.off('updated team');
            };
        }, []);

        useEffect(() => {
            if (!loading) {
                getTeam();
            }
        }, [loading]);

        const handleEditSubmit = async (e) => {
            e.preventDefault();
            if (!editingName) return;
            setLoading(true);
            const updatedPlayer = await API.editTeam(id, editingName);
            if (updatedPlayer.success) {
                setEditingName(editingName);
                setEditing(false);
                setLoading(false);
            }
        };

        return (
            <div key={id} className="drop-col">
                {!!team && team?.name && (
                    <React.Fragment>
                        <span id="eDropTarget" className="drop-target">
                            {editing ? (
                                <form onSubmit={(e) => handleEditSubmit(e)}>
                                    <TextField
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        name="playerName"
                                        size="small"
                                        autoFocus
                                    />

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
                                <React.Fragment>
                                    Equipe: {team.name}
                                </React.Fragment>
                            )}
                        </span>
                        <div className={`team-${id}`}>
                            {teamPlayers.map((teamPlayer) => {
                                return teamPlayer.teamID == id && <Player id={teamPlayer.player.id} />;
                            })}
                        </div>
                    </React.Fragment>
                )}
            </div>
        )
    }
);