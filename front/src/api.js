const API_URL = import.meta.env.VITE_API + "/api";

console.log( "API_URL", API_URL );

export async function getGame () {
  console.log( "API /getGame" );
  const response = await fetch( `${API_URL}/game` );
  console.log( "getGame response", response );
  return response.json();
}

export async function getPlayers () {
  console.log( "API /getPlayers" );
  const response = await fetch( `${API_URL}/getplayers` );
  console.log( "getPlayers response", response );
  return response.json();
}

export async function getPlayer (id) {
  console.log( "API /getPlayers" );
  const response = await fetch( `${API_URL}/getplayer/${id}` );
  console.log( "getPlayer response", response );
  return response.json();
}

export async function addLife ( playerId ) {
  console.log( "API /addLife", playerId );
  const response = await fetch( `${API_URL}/addlive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { id: playerId } ),
  } );
  console.log( "addLife response", response );
  return response.json();
}

export async function addPlayer ( name, lives ) {
  console.log( "API /addPlayer", name, lives );
  const response = await fetch( `${API_URL}/addplayer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { name, lives } ),
  } );
  console.log( "addPlayer response", response );
  return response.json();
}

export async function getMaxLives () {
  console.log( "API /getMaxLives" );
  const response = await fetch( `${API_URL}/getmaxlives` );
  console.log( "getMaxLives response", response );
  return response.json();
}

export async function setMaxLives ( value ) {
  console.log( "API /setMaxLives", value );
  const response = await fetch( `${API_URL}/setmaxlives`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { value } ),
  } );
  console.log( "setMaxLives response", response );
  return response.json();
}

export async function fetchGameSettings () {
  console.log( "API /fetchGameSettings" );
  const response = await fetch( `${API_URL}/getsettings` );
  console.log( "fetchGameSettings response", response );
  return response.json();
}

export async function updateGameSettings ( maximumLives ) {
  console.log( "API /updateGameSettings", maximumLives );
  const response = await fetch( `${API_URL}/updatesettings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { maximumLives } ),
  } );
  console.log( "updateGameSettings response", response );
  return response.json();
}

export async function resetLives ( maximumLives ) {
  console.log( "API /resetLives", maximumLives );
  const response = await fetch( `${API_URL}/resetlives`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { maximumLives } ),
  } );
  console.log( "resetLives response", response );
  return response.json();
}
export async function removePlayer ( playerId ) {
  console.log( "API /removePlayer", playerId );
  const response = await fetch( `${API_URL}/removeplayer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify( { id: playerId } ),
  } );

  const removedPlayerId = await response.json();
  console.log( "API /removePlayer response", removedPlayerId );
  return removedPlayerId;
}

export async function removeLife ( playerId ) {
  console.log( "API /removeLife", playerId );
  const response = await fetch( `${API_URL}/removelive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify( { id: playerId } ),
  } );

  const removedLife = await response.json();
  console.log( "API /removeLife response", removedLife );
  return removedLife;
}

export async function editPlayer ( playerId, newName, newTeamID ) {
  console.log( "API /editPlayer", playerId, newName, newTeamID );
  const response = await fetch( `${API_URL}/editplayer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify( { id: playerId, name: newName, teamID: newTeamID } ),
  } );

  const updatedPlayer = await response.json();
  console.log( "API /editPlayer response", updatedPlayer );
  return updatedPlayer;
}

export async function addTeam ( name, id ) {
  console.log( "API /addTeam", name, id );
  const response = await fetch( `${API_URL}/addteam`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify( { name, id } ),
  } );

  const addedTeam = await response.json();
  console.log( "API /addTeam response", addedTeam );
  return addedTeam;
}

export async function getTeams () {
  console.log( "API /getTeams" );
  const response = await fetch( `${API_URL}/getteams` );

  const teams = await response.json();
  console.log( "API /getTeams response", teams );
  return teams;
}

export async function getTeam (id) {
  console.log( "API /getTeam" );
  const response = await fetch( `${API_URL}/getteam/${id}` );

  const team = await response.json();
  console.log( "API /getTeam response", team );
  return team;
}

export async function editTeam ( id, newName ) {
  console.log( "API /editTeam", id, newName );
  const response = await fetch( `${API_URL}/editteam`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify( { id: id, name: newName } ),
  } );

  const updatedTeam = await response.json();
  console.log( "API /editTeam response", updatedTeam );
  return updatedTeam;
}

export async function removeTeam ( id ) {
  console.log( "API /removeTeam", id );
  const response = await fetch( `${API_URL}/removeteam`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify( { id: id } ),
  } );

  const removedTeamId = await response.json();
  console.log( "API /removeTeam response", removedTeamId );
  return removedTeamId;
}

