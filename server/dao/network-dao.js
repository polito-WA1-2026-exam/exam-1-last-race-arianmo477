

import db from '../db/db.js';

// Promisified multi-row query helper.
const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

// All stations with their map coordinates.
export function getStations() {
  return all('SELECT id, name, x, y FROM stations ORDER BY name');
}

// All lines (id + name only).
export function getLines() {
  return all('SELECT id, name FROM lines ORDER BY name');
}

// Full network for SETUP: stations, lines, and for each line the ordered
// list of station ids. The client uses this to draw the complete map.
export async function getFullNetwork() {
  const stations = await getStations();
  const lines = await getLines();

  // Ordered (line_id, station_id) rows, sorted along each line.
  const rows = await all(
    `SELECT line_id, station_id, position
     FROM line_stations
     ORDER BY line_id, position`
  );

  // Group station ids under each line, preserving order.
  const stationsByLine = new Map();
  for (const r of rows) {
    if (!stationsByLine.has(r.line_id)) stationsByLine.set(r.line_id, []);
    stationsByLine.get(r.line_id).push(r.station_id);
  }

  const linesWithStations = lines.map((l) => ({
    id: l.id,
    name: l.name,
    stations: stationsByLine.get(l.id) || [],
  }));

  return { stations, lines: linesWithStations };
}

// Build the raw directed edges from the ordered line membership: two stations
// adjacent in a line's ordering form an edge tagged with that line id.
// (Internal helper.)
async function getEdges() {
  // Self-join line_stations on consecutive positions within the same line.
  return all(
    `SELECT a.station_id AS fromId, b.station_id AS toId, a.line_id AS lineId
     FROM line_stations a
     JOIN line_stations b
       ON a.line_id = b.line_id AND b.position = a.position + 1`
  );
}

// Flat, de-duplicated list of connected station pairs for PLANNING.
// No line information is included. Each undirected pair appears once.
export async function getSegments() {
  const edges = await getEdges();
  const stations = await getStations();
  const nameById = new Map(stations.map((s) => [s.id, s.name]));

  const seen = new Set();
  const segments = [];
  for (const { fromId, toId } of edges) {
    // Normalize the pair so direction does not create duplicates.
    const key = fromId < toId ? `${fromId}-${toId}` : `${toId}-${fromId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    segments.push({
      fromId,
      toId,
      from: nameById.get(fromId),
      to: nameById.get(toId),
    });
  }
  return segments;
}

// Server-internal adjacency graph: Map<stationId, [{ to, lineId }, ...]>.
// Bidirectional, so traversal and validation can move either way along a line.
// This is NEVER serialized to the client.
export async function getAdjacency() {
  const edges = await getEdges();
  const adj = new Map();

  const addEdge = (from, to, lineId) => {
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from).push({ to, lineId });
  };

  for (const { fromId, toId, lineId } of edges) {
    addEdge(fromId, toId, lineId);
    addEdge(toId, fromId, lineId);
  }
  return adj;
}