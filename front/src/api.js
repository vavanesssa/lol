const API_URL = import.meta.env.VITE_API + "/api";

console.log( "API_URL", API_URL );

async function fetchData ( url, method = 'GET', body = null ) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify( body ) : null,
  };

  console.log( `API ${method} ${url}` );
  const response = await fetch( `${API_URL}${url}`, options );
  console.log( `API ${url} response`, response );
  return response.json();
}

export async function getGame () {
  return fetchData( '/getgame' );
}

export async function getPlayers () {
  return fetchData( '/getplayers' );
}

export async function addLife ( playerId ) {
  return fetchData( '/addlive', 'POST', { id: playerId } );
}

export async function addPlayer ( name, id, lives ) {
  return fetchData( '/addplayer', 'POST', { name, id, lives } );
}

export async function getMaxLives () {
  return fetchData( '/getmaxlives' );
}

export async function setMaxLives ( value ) {
  return fetchData( '/setmaxlives', 'POST', { value } );
}

export async function fetchGameSettings () {
  return fetchData( '/getsettings' );
}

export async function updateGameSettings ( maximumLives ) {
  return fetchData( '/updatesettings', 'POST', { maximumLives } );
}

export async function resetLives ( maximumLives ) {
  return fetchData( '/resetlives', 'POST', { maximumLives } );
}

export async function removePlayer ( playerId ) {
  return fetchData( '/removeplayer', 'POST', { id: playerId } );
}

export async function removeLife ( playerId ) {
  return fetchData( '/removelive', 'POST', { id: playerId } );
}

export async function editPlayer ( playerId, newName, newTeamID ) {
  return fetchData( '/editplayer', 'POST', { id: playerId, name: newName, teamID: newTeamID } );
}

export async function addTeam ( name, id ) {
  return fetchData( '/addteam', 'POST', { name, id } );
}

export async function getTeams () {
  return fetchData( '/getteams' );
}

export async function editTeam ( id, newName ) {
  return fetchData( '/editteam', 'POST', { id, name: newName } );
}

export async function removeTeam ( id ) {
  return fetchData( '/removeteam', 'POST', { id } );
}
