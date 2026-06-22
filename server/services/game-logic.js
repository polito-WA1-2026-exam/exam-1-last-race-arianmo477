

export const START_COINS = 20;
export const MIN_DISTANCE = 3; // destination must be at least 3 stops away


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


export function assignStartAndDest(adj, stationIds) {
  
  const candidates = [...stationIds];

  
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

 
  throw new Error('No start/destination pair satisfies the minimum distance.');
}


export function computeScore(events) {
  const total = events.reduce((sum, e) => sum + e.effect, START_COINS);
  return Math.max(0, total);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}