import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as API from './api';
import socket from './socket';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './style.css';
import { Team } from './Team';
import { Player } from './Player';
import { deepEqual } from './utils';

export const PlayerList = () => {
    //team : {id: string, name: string, playersInTeam: [{ id: string }]}
    const [players, setPlayers] = useState();
    const [teams, setTeams] = useState();
    const [loading, setLoading] = useState(false);

    const getPlayers = async () => {
        const playersFromApi = await API.getPlayers();
        if (playersFromApi) {
            console.log('REACT/ fetching all player', playersFromApi);
            setPlayers(playersFromApi);
        }
    };

    const getTeams = async () => {
        const teamsFromApi = await API.getTeams();
        if (teamsFromApi) {
            console.log('REACT/ fetching all teams', teamsFromApi);
            setTeams(teamsFromApi);
        }
    };

    useEffect(() => {
        const handleEjectedPlayer = (data) => {
            const playerFromSocket = data;
            const playerFound = players.find(p => p.id == playerFromSocket.id);
            if (playerFound && !deepEqual(playerFromSocket, playerFound)) {
                getPlayers();
            }
        };
    
        const handlePlayerAdded = (data) => {
            const playerFromSocket = data;
            if(playerFromSocket){
                getPlayers();
            }
        };
    
        const handlePlayerRemoved = (data) => {
            const playerFromSocket = data;
            const playerFound = players.find(p => p.id == playerFromSocket.id);
            if (playerFound && deepEqual(playerFromSocket, playerFound)) {
                getPlayers();
            }
        };
    
        const handlePlayerUpdated = (data) => {
            const playerFromSocket = data;
            const playerFound = players && players?.find(p => p.id == playerFromSocket.id);
            if (!players || (playerFound && !deepEqual(playerFromSocket, playerFound))) {
                getPlayers();
            }
        };
    
        const handlePlayersReset = () => {
            getPlayers();
        };

        socket.on("ejectedPlayer", handleEjectedPlayer);
        socket.on('playerAdded', handlePlayerAdded);
        socket.on('playerRemoved', handlePlayerRemoved);
        socket.on("playerUpdated", handlePlayerUpdated);
        socket.on('playersReset', handlePlayersReset);
        return () => {
            socket.off("ejectedPlayer", handleEjectedPlayer);
            socket.off('playerAdded', handlePlayerAdded);
            socket.off('playerRemoved', handlePlayerRemoved);
            socket.on("playerUpdated", handlePlayerUpdated);
            socket.off('playersReset', handlePlayersReset);
        };
    }, [players]);

    useEffect(() => {
        getTeams();
        getPlayers();
    }, []);

    useEffect(() => {
        if (!loading) {
            // setLoading(true);
            getPlayers();
        }
    }, [loading]);

    const gridStyle = useMemo(() => ({ height: '400px', width: '100%' }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'id', cellRenderer: params => {
                console.log("field ", params)
                return <Player id={params.value} />;
            }, rowDrag: true, autoHeight: true,
        },
        { field: 'name', hide: true },
        { field: 'lives', hide: true },
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
        console.log("handleAddPlayerTeam ",players)
        if (players) {
            const playerWithoutTeam = players.filter(p => p.teamID == "");
            console.log("handleAddPlayerTeam ",playerWithoutTeam)
            setRowData(playerWithoutTeam);
        }
    }, [players]);

    const handleAddPlayerTeam = async (team, playerID) => {
        console.log("REACT/handleAddPlayerTeam",team,playerID);
        await API.editTeam({ ...team, playersInTeam: [...team.playersInTeam, playerID] }, playerID);
      };

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
        teams && !!teams.length && teams.forEach((team) => {
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

    return (
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
    )
};