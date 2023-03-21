const API_URL = 'http://localhost:3001';

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

export async function addPlayer ( firstname, lastname, id ) {
  const response = await fetch( `${API_URL}/addplayer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify( { firstname, lastname, id } ),
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
