
import { Card, Button, Badge } from 'react-bootstrap';

function ResultPhase({ result, onNewGame }) {
  const steps = result.steps || [];

  return (
    <Card className="lr-card mx-auto" style={{ maxWidth: '560px' }}>
      <Card.Body className="text-center">
        <div style={{ fontSize: '2.4rem' }}>🏆</div>
        <Card.Title as="h3" className="text-teal mb-1">
          Game over
        </Card.Title>
        <div className="text-muted mb-3">Thanks for playing Last Race!</div>

        <div className="bg-teal-soft rounded-3 py-3 mb-3">
          <div className="text-muted small">FINAL SCORE</div>
          <div style={{ fontSize: '3rem', fontWeight: 800 }} className="text-teal">
            {result.score}
          </div>
          <div className="text-muted small">coins</div>
          <div className="mt-2">
            {result.valid ? (
              <Badge bg="success">✓ Valid route completed</Badge>
            ) : (
              <Badge bg="danger">✗ Invalid or incomplete route</Badge>
            )}
          </div>
        </div>

        {!result.valid && (
          <div className="text-muted small mb-3">
            {result.reason} You lost all your coins.
          </div>
        )}

        {steps.length > 0 && (
          <div className="text-start mb-3">
            <div className="fw-semibold mb-2">Journey history &amp; events</div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <ol className="mb-0 ps-3">
                {steps.map((s) => (
                  <li key={s.step} className="mb-1 small">
                    <strong>{s.from} → {s.to}:</strong>{' '}
                    {s.event.description}{' '}
                    <span className={s.event.effect >= 0 ? 'text-success' : 'text-danger'}>
                      ({s.event.effect >= 0 ? '+' : ''}{s.event.effect} coins)
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        <div className="d-flex gap-2 justify-content-center">
          <Button variant="primary" onClick={onNewGame}>
            Play again
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ResultPhase;