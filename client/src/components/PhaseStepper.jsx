
import { Card } from 'react-bootstrap';

const PHASES = [
  { key: 'setup', title: 'Setup', sub: 'Study the map' },
  { key: 'planning', title: 'Planning', sub: 'Build a route' },
  { key: 'execution', title: 'Execution', sub: 'Live events' },
  { key: 'result', title: 'Result', sub: 'Final score' },
];

function Badge({ state, label }) {
  // state: 'done' | 'active' | 'todo'
  const base = {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 700,
    fontSize: 14,
    flex: '0 0 auto',
  };
  if (state === 'done') {
    return <span style={{ ...base }} className="bg-success text-white">✓</span>;
  }
  if (state === 'active') {
    return (
      <span style={{ ...base, border: '2px solid var(--bs-success)' }} className="bg-white text-success">
        {label}
      </span>
    );
  }
  return <span style={{ ...base }} className="bg-light text-muted border">{label}</span>;
}

function PhaseStepper({ current }) {
  const currentIndex = PHASES.findIndex((p) => p.key === current);

  return (
    <Card className="shadow-sm mb-3">
      <Card.Body className="d-flex align-items-center py-2">
        {PHASES.map((p, i) => {
          const state = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'todo';
          return (
            <div key={p.key} className="d-flex align-items-center flex-fill">
              <div className="d-flex align-items-center gap-2">
                <Badge state={state} label={i + 1} />
                <div className="lh-sm">
                  <div className={`fw-semibold small ${state === 'active' ? 'text-success' : ''}`}>
                    {p.title}
                  </div>
                  <div className="text-muted" style={{ fontSize: 11 }}>
                    {p.sub}
                  </div>
                </div>
              </div>
              {i < PHASES.length - 1 && (
                <div
                  className={`flex-fill mx-2 ${i < currentIndex ? 'bg-success' : 'bg-secondary-subtle'}`}
                  style={{ height: 3, borderRadius: 2, minWidth: 16 }}
                />
              )}
            </div>
          );
        })}
      </Card.Body>
    </Card>
  );
}

export default PhaseStepper;