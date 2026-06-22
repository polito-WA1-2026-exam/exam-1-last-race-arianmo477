
import { useState, useEffect } from 'react';
import { Card, Table, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../API.js';

const STEPS = [
  ['1', 'Setup', 'Study the full network map with every line and station.'],
  ['2', 'Planning', 'Get a random start and destination at least 3 segments apart. Lines vanish — rebuild your route from memory in 90 seconds.'],
  ['3', 'Execution', 'Each segment triggers a random event that adds or removes coins.'],
  ['4', 'Result', 'Your remaining coins are your score. Invalid or incomplete routes score zero.'],
];

function Instructions() {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    let cancelled = false;
    API.getEvents()
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch(() => {
        if (!cancelled) setEvents([]); // fail soft: show an empty table
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto" style={{ maxWidth: '960px' }}>
      {/* Hero */}
      <Card
        className="text-white shadow-sm mb-4 border-0"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #19a394 100%)' }}
      >
        <Card.Body className="p-4 p-md-5">
          <div className="d-flex align-items-center mb-2">
            <span style={{ fontSize: '2rem' }} className="me-2">🚝</span>
            <h1 className="mb-0 fw-bold">Last Race</h1>
          </div>
          <p className="mb-3 fs-5 opacity-75">
            Race across a fictional metro network, dodge random events, and reach
            your destination with the highest score.
          </p>
          <div className="d-flex flex-wrap gap-3">
            <Badge bg="light" text="dark" className="fs-6 px-3 py-2">💰 Start with 20 coins</Badge>
            <Badge bg="light" text="dark" className="fs-6 px-3 py-2">⏱️ 90 seconds to plan</Badge>
            <Badge bg="light" text="dark" className="fs-6 px-3 py-2">🎲 Events from −4 to +4</Badge>
          </div>
        </Card.Body>
      </Card>

      {/* Two columns */}
      <Row className="g-4">
        <Col lg={7}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="fw-bold mb-3">How to play</h5>
              {STEPS.map(([n, title, body]) => (
                <div key={n} className="d-flex mb-3">
                  <Badge
                    bg="success"
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                    style={{ width: 34, height: 34, fontSize: 15 }}
                  >
                    {n}
                  </Badge>
                  <div>
                    <div className="fw-semibold">{title}</div>
                    <div className="text-muted small">{body}</div>
                  </div>
                </div>
              ))}
              <div className="bg-success-subtle rounded-3 p-3 small mt-3">
                <strong>Route rules:</strong> follow metro lines and change lines
                only at interchange stations. Each segment can be used at most
                once; revisiting a station is allowed.
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="fw-bold mb-1">Possible events</h5>
              <div className="text-muted small mb-3">
                One is rolled at random on every segment.
              </div>

              {events === null ? (
                <div className="d-flex justify-content-center py-3">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (
                <Table size="sm" hover className="mb-0 align-middle">
                  <tbody>
                    {events.map((ev) => (
                      <tr key={ev.id}>
                        <td>{ev.description}</td>
                        <td className="text-end">
                          <Badge bg={ev.effect > 0 ? 'success' : ev.effect < 0 ? 'danger' : 'secondary'}>
                            {ev.effect > 0 ? '+' : ''}{ev.effect}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CTA */}
      <Card className="shadow-sm mt-4 text-center">
        <Card.Body className="py-4">
          <h5 className="fw-bold mb-1">Ready to plan your route?</h5>
          <p className="text-muted mb-3">
            Log in to access the live map, build paths, and climb the leaderboard.
          </p>
          <Button as={Link} to="/login" variant="primary" size="lg">
            Log in to play
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Instructions;