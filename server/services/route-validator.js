

// Build, for a pair of adjacent stations, the set of line ids serving that
// segment. Returns a Set (empty if the pair is not actually connected).
function linesForSegment(adj, fromId, toId) {
  const lines = new Set();
  for (const edge of adj.get(fromId) || []) {
    if (edge.to === toId) lines.add(edge.lineId);
  }
  return lines;
}

// A station is an interchange if it is served by more than one line.
function isInterchange(adj, stationId) {
  const lines = new Set((adj.get(stationId) || []).map((e) => e.lineId));
  return lines.size > 1;
}

// Validate a route given the adjacency graph and the assigned endpoints.
// `route` is an ordered array of station ids.
export function validateRoute(adj, route, startId, destId) {
  // Rule 1: need at least one segment.
  if (!Array.isArray(route) || route.length < 2) {
    return { valid: false, reason: 'Route must contain at least one segment.' };
  }

  // Rule 2 & 3: endpoints must match the assignment.
  if (route[0] !== startId) {
    return { valid: false, reason: 'Route does not start at the assigned station.' };
  }
  if (route[route.length - 1] !== destId) {
    return { valid: false, reason: 'Route does not end at the assigned destination.' };
  }

  // Walk the route segment by segment.
  // `currentLines` = the set of lines we could be travelling on right now.
  let currentLines = null;
  // Track segments already used (undirected) so none is reused (final-spec rule).
  const usedSegments = new Set();

  for (let i = 0; i < route.length - 1; i++) {
    const fromId = route[i];
    const toId = route[i + 1];

    // Rule 4: the pair must be a real segment.
    const segLines = linesForSegment(adj, fromId, toId);
    if (segLines.size === 0) {
      return {
        valid: false,
        reason: `Stations at positions ${i} and ${i + 1} are not directly connected.`,
      };
    }

    // Rule 6: no segment may be used more than once (undirected).
    const segKey = fromId < toId ? `${fromId}-${toId}` : `${toId}-${fromId}`;
    if (usedSegments.has(segKey)) {
      return {
        valid: false,
        reason: `Segment at position ${i} is used more than once.`,
      };
    }
    usedSegments.add(segKey);

    if (currentLines === null) {
      // First segment: we are free to be on any line serving it.
      currentLines = segLines;
    } else {
      // Lines we can keep travelling on without changing.
      const shared = intersect(currentLines, segLines);
      if (shared.size > 0) {
        // Still on a common line: no change, narrow the possibilities.
        currentLines = shared;
      } else {
        // Rule 5: a line change happened at `fromId`; legal only if it is an
        // interchange station.
        if (!isInterchange(adj, fromId)) {
          return {
            valid: false,
            reason: `Line change at a non-interchange station (position ${i}).`,
          };
        }
        // After changing, we are on one of the new segment's lines.
        currentLines = segLines;
      }
    }
  }

  return { valid: true, reason: 'OK' };
}

// Set intersection helper.
function intersect(a, b) {
  const out = new Set();
  for (const x of a) if (b.has(x)) out.add(x);
  return out;
}