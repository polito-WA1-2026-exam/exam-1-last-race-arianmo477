

export const START_COINS = 20;
export const MIN_DISTANCE = 3; // destination must be at least 3 stops away

// Breadth-first search over the bidirectional adjacency graph.
// Returns a Map from station id to its hop-distance from startId.
// Unreachable stations simply do not appear in the map.
export function bfsDistances(adj, startId) {
  const dist = new Map([[startId, 0]]);
  const queue = [startId];

  while (queue.length > 0) {
    const current = queue.shift();
    const d = dist.get(current);
    for (const { to } of adj.get(current) || []) {
      if (!dist.has(to)) {
        dist.set(to, d + 1);
        queue.push(to);
      }
    }
  }
  return dist;
}

// Randomly pick a start station and a destination that is reachable and at
// least MIN_DISTANCE hops away. Re-rolls the start until at least one valid
// destination exists, then picks uniformly among the valid destinations.
export function assignStartAndDest(adj, stationIds) {
  // Defensive copy so we can shuffle/iterate without side effects.
  const candidates = [...stationIds];

  // Try each possible start in random order until one yields a valid dest.
  shuffle(candidates);

  for (const startId of candidates) {
    const dist = bfsDistances(adj, startId);
    const farEnough = [];
    for (const [stationId, hops] of dist) {
      if (hops >= MIN_DISTANCE) farEnough.push(stationId);
    }
    if (farEnough.length > 0) {
      const destId = farEnough[Math.floor(Math.random() * farEnough.length)];
      return { startId, destId };
    }
  }

  // With a connected network of this size this is unreachable, but fail loud
  // rather than return something invalid.
  throw new Error('No start/destination pair satisfies the minimum distance.');
}

// Final score: 20 starting coins plus the sum of the applied event effects.
// Negative totals are stored/shown as zero (handled here and guarded in DAO).
export function computeScore(events) {
  const total = events.reduce((sum, e) => sum + e.effect, START_COINS);
  return Math.max(0, total);
}

// Fisher-Yates in-place shuffle.
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}