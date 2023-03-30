const API_URL = import.meta.env.VITE_API + "/api";

console.log( "API_URL", API_URL );

export async function getPlayers () {
  const response = await fetch( `${API_URL}/getplayers` );
  return response.json();
}

export async function addLife ( playerId ) {

  const response = await fetch( `${API_URL}/addlive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { id: playerId } ),
  } );

  return response.json();
}

export async function addPlayer ( name, id, lives ) {
  const response = await fetch( `${API_URL}/addplayer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { name, id, lives } ),
  } );

  return response.json();
}

// Add these functions to api.js
export async function getMaxLives () {
  const response = await fetch( `${API_URL}/getmaxlives` );
  return response.json();
}

export async function setMaxLives ( value ) {
  const response = await fetch( `${API_URL}/setmaxlives`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { value } ),
  } );

  return response.json();
}

export async function fetchGameSettings () {
  const response = await fetch( `${API_URL}/getsettings` );
  return response.json();
}

export async function updateGameSettings ( maximumLives ) {
  const response = await fetch( `${API_URL}/updatesettings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { maximumLives } ),
  } );
  return response.json();
}

export async function resetLives ( maximumLives ) {
  const response = await fetch( `${API_URL}/resetlives`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { maximumLives } ),
  } );
  return response.json();
}

export async function removePlayer ( playerId ) {
  const response = await fetch( `${API_URL}/removeplayer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { id: playerId } ),
  } );

  const removedPlayerId = await response.json();
  return removedPlayerId;
}

export async function removeLife ( playerId ) {
  const response = await fetch( `${API_URL}/removelive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { id: playerId } ),
  } );

  return response.json();
}

export async function editPlayer ( playerId, newName ) {
  const response = await fetch( `${API_URL}/editplayer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { id: playerId, name: newName } ),
  } );

  return response.json();
}

export async function addTeam ( name, id ) {
  const response = await fetch( `${API_URL}/addteam`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { name, id } ),
  } );

  return response.json();
}

// export const addTeam = async ( name ) => {
//   const response = await fetch( `${API_URL}/addteam`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify( { name } ),
//   } );

//   if ( response.ok ) {
//     const newTeam = await response.json();
//     return newTeam;
//   } else {
//     throw new Error( "Failed to add team" );
//   }
// };

// Get all teams
export async function getTeams () {
  const response = await fetch( `${API_URL}/getteams` );
  return response.json();
}

// Edit team
export async function editTeam ( teamId, newName ) {
  const response = await fetch( `${API_URL}/editteam`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { id: teamId, name: newName } ),
  } );

  return response.json();
}

// Remove team
// export async function removeTeam ( teamId ) {
//   const response = await fetch( `${API_URL}/removeteam`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify( { teamId: teamId } ),

//   } );

//   const removedTeamId = await response.json();
//   return removedTeamId;
// }

export async function removeTeam ( teamId ) {
  const response = await fetch( `${API_URL}/removeteam`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { id: teamId } ),
  } );

  const removedTeamId = await response.json();
  return removedTeamId;
}

