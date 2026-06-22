

const SERVER_URL = 'http://localhost:3001';


async function apiRequest(path, options = {}) {
  const response = await fetch(SERVER_URL + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  // 204 / empty bodies (e.g. logout) -> nothing to parse.
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = data?.error || `Request failed (${response.status}).`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  return data;
}

// ---- Authentication -------------------------------------------------------


function logIn(credentials) {
  return apiRequest('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

async function getCurrentSession() {
  try {
    return await apiRequest('/api/sessions/current');
  } catch (err) {
    if (err.status === 401) return null; // not logged in is a normal state
    throw err;
  }
}


function logOut() {
  return apiRequest('/api/sessions/current', { method: 'DELETE' });
}

// ---- Network --------------------------------------------------------------


function getNetwork() {
  return apiRequest('/api/network');
}


function getSegments() {
  return apiRequest('/api/network/segments');
}

function getEvents() {
  return apiRequest('/api/events');
}

// ---- Game -----------------------------------------------------------------


function startGame() {
  return apiRequest('/api/games', { method: 'POST' });
}


function submitRoute(gameId, route) {
  return apiRequest(`/api/games/${gameId}/route`, {
    method: 'POST',
    body: JSON.stringify({ route }),
  });
}

// ---- Ranking --------------------------------------------------------------


function getRanking() {
  return apiRequest('/api/ranking');
}

const API = {
  logIn,
  getCurrentSession,
  logOut,
  getNetwork,
  getSegments,
  getEvents,
  startGame,
  submitRoute,
  getRanking,
};

export default API;