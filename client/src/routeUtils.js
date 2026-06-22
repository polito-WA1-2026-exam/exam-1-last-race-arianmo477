


export function segmentKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}


export function segmentsToRoute(pickedSegments, startId = null) {
  if (!pickedSegments || pickedSegments.length === 0) return [];

  const first = pickedSegments[0];

  
  let route;
  if (startId != null && first.toId === startId) {
    route = [first.toId, first.fromId];
  } else {
    route = [first.fromId, first.toId];
  }

  for (let i = 1; i < pickedSegments.length; i++) {
    const seg = pickedSegments[i];
    const end = route[route.length - 1];

    if (seg.fromId === end) {
      route.push(seg.toId);
    } else if (seg.toId === end) {
      route.push(seg.fromId);
    } else {
      
      route.push(seg.fromId, seg.toId);
    }
  }

  return route;
}