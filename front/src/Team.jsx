import React, { useState, useEffect } from 'react';
import { IconButton, Button, TextField } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Edit as EditIcon, DeleteForever as DeleteForeverIcon, Settings as SettingsIcon } from '@mui/icons-material';
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

        const handleTeamUpdated = (data) => {
            const teamFromSocket = JSON.parse(data);
            // if (teamFromSocket !== team) {
                if(teamFromSocket.id == id){
                    getTeam();
                }
            // 
        };

        useEffect(() => {
            getTeam();
            socket.on("teamUpdated", handleTeamUpdated);
            return () => {
                socket.off( 'teamUpdated', handleTeamUpdated);
            };
        }, []);

        useEffect(() => {
            if (!loading) {
                getTeam();
            }
        }, [loading]);

        const handleRemoveTeam = async () => {
            console.log("REACT/handleRemoveTeam", { id });
            const response = await API.removeTeam(id);
            if (response.success) {
                setLoading(false);
                socket.emit( 'teamRemoved', id );
                console.log("REACT/handleRemoveTeam complete");
            }
        };

        const handleEditSubmit = async (e) => {
            e.preventDefault();
            if (!editingName) return;
            setLoading(true);
            const updatedTeam = await API.editTeam(id, editingName);
            if (updatedTeam.success) {
                setEditingName(editingName);
                setEditing(false);
                setLoading(false);
                socket.emit( 'teamUpdated', updatedTeam );
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
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleRemoveTeam()} color="secondary" aria-label="add an alarm">
                                <DeleteForeverIcon />
                            </IconButton>
                        </div>
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