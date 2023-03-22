const API_URL = import.meta.env.VITE_API;

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

export async function addPlayer ( firstname, lastname, id, lives ) {
  const response = await fetch( `${API_URL}/addplayer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { firstname, lastname, id, lives } ),
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
