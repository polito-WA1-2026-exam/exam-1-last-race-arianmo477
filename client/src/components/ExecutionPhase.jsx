import { useState, useEffect, useRef } from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';

const STEP_INTERVAL_MS = 1200;

function ExecutionPhase({ result, onDone }) {
  const steps = result.steps || [];
  const [revealed, setRevealed] = useState(0);

  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    
    if (steps.length === 0) {
      const t = setTimeout(() => onDoneRef.current?.(), 600);
      return () => clearTimeout(t);
    }

    // Reveal one step at a time.
    const id = setInterval(() => {
      setRevealed((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          clearInterval(id);
          setTimeout(() => onDoneRef.current?.(), 1000);
        }
        return next;
      });
    }, STEP_INTERVAL_MS);

    return () => clearInterval(id);
  }, [steps.length]);

  function effectBadge(effect) {
    if (effect > 0) return <Badge bg="success">+{effect}</Badge>;
    if (effect < 0) return <Badge bg="danger">{effect}</Badge>;
    return <Badge bg="secondary">0</Badge>;
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title>Execution — your journey unfolds</Card.Title>

        {steps.length === 0 ? (
          <Card.Text className="text-danger">
            {result.reason || 'The route was invalid.'} Calculating result…
          </Card.Text>
        ) : (
          <ListGroup variant="flush">
            {steps.slice(0, revealed).map((s) => (
              <ListGroup.Item key={s.step} className="d-flex justify-content-between align-items-center">
                <div>
                  <div><strong>{s.from}</strong> → <strong>{s.to}</strong></div>
                  <div className="text-muted small">{s.event.description}</div>
                </div>
                <div className="text-end">
                  <div className="mb-1">{effectBadge(s.event.effect)}</div>
                  <div><strong>{s.runningTotal}</strong> coins</div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
}

export default ExecutionPhase;