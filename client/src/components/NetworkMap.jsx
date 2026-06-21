import { useMemo } from 'react';

const LINE_COLORS = {
  'Linea Aurora': '#e63946',
  'Linea Marea': '#1d6fb8',
  'Linea Vento': '#2a9d4a',
  'Linea Sole': '#e0a500',
};
const FALLBACK_LINE_COLOR = '#888888';

const VIEWBOX_WIDTH = 900;
const VIEWBOX_HEIGHT = 580;
const STATION_RADIUS = 9;

function NetworkMap({
  stations = [],
  lines = [],
  showLines = false,
  startId = null,
  destId = null,
  onStationClick = null,
  armedId = null,
  routeStationIds = [],
}) {
  const posById = useMemo(() => {
    const m = new Map();
    for (const s of stations) m.set(s.id, s);
    return m;
  }, [stations]);

  const inRoute = useMemo(() => new Set(routeStationIds), [routeStationIds]);

  const linePaths = useMemo(() => {
    if (!showLines) return [];
    return lines.map((line) => {
      const points = line.stations
        .map((sid) => posById.get(sid))
        .filter(Boolean)
        .map((s) => `${s.x},${s.y}`)
        .join(' ');
      const color = LINE_COLORS[line.name] ?? FALLBACK_LINE_COLOR;
      return { id: line.id, points, color };
    });
  }, [showLines, lines, posById]);

  const interactive = typeof onStationClick === 'function';

  function stationFill(stationId) {
    if (stationId === startId) return '#198754';
    if (stationId === destId) return '#dc3545';
    if (stationId === armedId) return '#ffc107';
    if (inRoute.has(stationId)) return '#0d6efd';
    return '#343a40';
  }

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      width="100%"
      role="img"
      aria-label="Underground network map"
      style={{
        background: '#f8f9fa',
        borderRadius: '12px',
        maxHeight: '580px',
        border: '1px solid #dee2e6',
      }}
    >
      {showLines &&
        linePaths.map((lp) => (
          <polyline
            key={lp.id}
            points={lp.points}
            fill="none"
            stroke={lp.color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
        ))}

      {stations.map((s) => {
        const isArmed = s.id === armedId;
        return (
          <g
            key={s.id}
            onClick={interactive ? () => onStationClick(s.id) : undefined}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            {interactive && (
              <circle cx={s.x} cy={s.y} r={STATION_RADIUS + 10} fill="transparent" />
            )}
            {isArmed && (
              <circle
                cx={s.x}
                cy={s.y}
                r={STATION_RADIUS + 6}
                fill="none"
                stroke="#ffc107"
                strokeWidth="2"
                opacity="0.9"
              />
            )}
            <circle
              cx={s.x}
              cy={s.y}
              r={STATION_RADIUS}
              fill={stationFill(s.id)}
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text
              x={s.x + 12}
              y={s.y + 4}
              fontSize="13"
              fill="#212529"
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              {s.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default NetworkMap;