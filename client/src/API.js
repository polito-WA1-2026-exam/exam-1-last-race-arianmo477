/*
 * API.js
 * ------
 * The single place where the client talks to the server. Every component
 * imports from here instead of calling fetch directly, so the API contract
 * lives in one file and the components stay clean.
 *
 * All requests use credentials: 'include' so the session cookie is sent and
 * received across the two-server (CORS) setup.
 */

const SERVER_URL = 'http://localhost:3001';

// Small helper: perform a fetch, parse JSON, and throw a useful error on
// non-2xx responses so callers can handle failures uniformly.
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

// Log in with username + password. Returns { id, username } on success.
function logIn(credentials) {
  return apiRequest('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

// Return the currently logged-in user, or null if there is no valid session.
async function getCurrentSession() {
  try {
    return await apiRequest('/api/sessions/current');
  } catch (err) {
    if (err.status === 401) return null; // not logged in is a normal state
    throw err;
  }
}

// Log out the current user.
function logOut() {
  return apiRequest('/api/sessions/current', { method: 'DELETE' });
}

// ---- Network --------------------------------------------------------------

// Full network (stations + lines + ordering) for the Setup phase.
function getNetwork() {
  return apiRequest('/api/network');
}

// Flat list of connected station pairs (no line info) for the Planning phase.
function getSegments() {
  return apiRequest('/api/network/segments');
}

// The list of possible events (public — also used on the instructions page).
function getEvents() {
  return apiRequest('/api/events');
}

// ---- Game -----------------------------------------------------------------

// Start a new game. Returns { gameId, start, destination, startCoins,
// planningSeconds, startedAt }.
function startGame() {
  return apiRequest('/api/games', { method: 'POST' });
}

// Submit a built route (ordered array of station ids) for a game.
// Returns { valid, reason, score, steps }.
function submitRoute(gameId, route) {
  return apiRequest(`/api/games/${gameId}/route`, {
    method: 'POST',
    body: JSON.stringify({ route }),
  });
}

// ---- Ranking --------------------------------------------------------------

// General ranking: each user's best score. Returns [{ username, bestScore }].
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