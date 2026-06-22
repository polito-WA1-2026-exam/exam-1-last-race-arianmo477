

function linesForSegment(adj, fromId, toId) {
  const lines = new Set();
  for (const edge of adj.get(fromId) || []) {
    if (edge.to === toId) lines.add(edge.lineId);
  }
  return lines;
}


function isInterchange(adj, stationId) {
  const lines = new Set((adj.get(stationId) || []).map((e) => e.lineId));
  return lines.size > 1;
}


export function validateRoute(adj, route, startId, destId) {
  
  if (!Array.isArray(route) || route.length < 2) {
    return { valid: false, reason: 'Route must contain at least one segment.' };
  }

  
  if (route[0] !== startId) {
    return { valid: false, reason: 'Route does not start at the assigned station.' };
  }
  if (route[route.length - 1] !== destId) {
    return { valid: false, reason: 'Route does not end at the assigned destination.' };
  }

  
  let currentLines = null;
  
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

    
    const segKey = fromId < toId ? `${fromId}-${toId}` : `${toId}-${fromId}`;
    if (usedSegments.has(segKey)) {
      return {
        valid: false,
        reason: `Segment at position ${i} is used more than once.`,
      };
    }
    usedSegments.add(segKey);

    if (currentLines === null) {
      
      currentLines = segLines;
    } else {
      
      const shared = intersect(currentLines, segLines);
      if (shared.size > 0) {
        
        currentLines = shared;
      } else {
        
        if (!isInterchange(adj, fromId)) {
          return {
            valid: false,
            reason: `Line change at a non-interchange station (position ${i}).`,
          };
        }
        
        currentLines = segLines;
      }
    }
  }

  return { valid: true, reason: 'OK' };
}


function intersect(a, b) {
  const out = new Set();
  for (const x of a) if (b.has(x)) out.add(x);
  return out;
}