
import { useState, useRef, useMemo } from 'react';
import { Card, Row, Col, Button, Alert } from 'react-bootstrap';
import NetworkMap from './NetworkMap.jsx';
import SegmentList from './SegmentList.jsx';
import RouteBuilder from './RouteBuilder.jsx';
import Timer from './Timer.jsx';
import { segmentKey, segmentsToRoute } from '../routeUtils.js';

function PlanningPhase({ game, stations, segments, onSubmit }) {
  const [picked, setPicked] = useState([]);
  const [armedId, setArmedId] = useState(null);
  const [hint, setHint] = useState('');
  const submittedRef = useRef(false);

  const nameById = useMemo(() => {
    const m = new Map();
    for (const s of stations) m.set(s.id, s.name);
    return m;
  }, [stations]);

  const segmentByKey = useMemo(() => {
    const m = new Map();
    for (const s of segments) m.set(segmentKey(s.fromId, s.toId), s);
    return m;
  }, [segments]);

  const usedKeys = useMemo(() => {
    const set = new Set();
    for (const s of picked) set.add(segmentKey(s.fromId, s.toId));
    return set;
  }, [picked]);

  const routeStationIds = useMemo(
    () => segmentsToRoute(picked, game.start.id),
    [picked, game.start.id]
  );

  function addSegment(seg) {
    const key = segmentKey(seg.fromId, seg.toId);
    if (usedKeys.has(key)) {
      setHint('That segment is already used.');
      return;
    }
    setHint('');
    setPicked((prev) => [...prev, seg]);
  }

  function handlePickFromList(seg) {
    addSegment(seg);
  }

  function handleStationClick(stationId) {
    if (armedId === null) {
      setArmedId(stationId);
      setHint('');
      return;
    }
    if (armedId === stationId) {
      setArmedId(null);
      return;
    }
    const key = segmentKey(armedId, stationId);
    const seg = segmentByKey.get(key);
    if (!seg) {
      setHint(
        `${nameById.get(armedId)} and ${nameById.get(stationId)} are not a direct segment.`
      );
      setArmedId(null);
      return;
    }
    addSegment(seg);
    setArmedId(null);
  }

  function handleUndo() {
    setPicked((prev) => prev.slice(0, -1));
    setHint('');
  }

  function handleReset() {
    setPicked([]);
    setArmedId(null);
    setHint('');
  }

  function doSubmit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit(segmentsToRoute(picked, game.start.id));
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">Build your route</Card.Title>

        <Alert variant="warning" className="d-flex flex-wrap align-items-center gap-2 py-2 mb-3">
          <span>🚩</span>
          <span><strong>Start:</strong> {game.start.name}</span>
          <span className="text-muted">—</span>
          <span><strong>Destination:</strong> {game.destination.name}</span>
          <span className="text-muted ms-auto small">Lines are hidden — hurry!</span>
        </Alert>

        <div className="mb-3">
          <Timer seconds={game.planningSeconds} onExpire={doSubmit} />
        </div>

        <Row className="g-3">
          <Col lg={7}>
            <NetworkMap
              stations={stations}
              showLines={false}
              startId={game.start.id}
              destId={game.destination.id}
              onStationClick={handleStationClick}
              armedId={armedId}
              routeStationIds={routeStationIds}
            />
            <div className="text-muted small mt-2">
              Tip: click two connected stations on the map to add a segment, or
              pick from the list. Build any path you like — the server checks it
              when you submit.
            </div>
          </Col>

          <Col lg={5}>
            <RouteBuilder
              pickedSegments={picked}
              onUndo={handleUndo}
              onReset={handleReset}
            />

            {hint && (
              <Alert variant="warning" className="py-1 px-2 my-2 small">
                {hint}
              </Alert>
            )}

            <hr />

            <div className="mb-2">
              <strong>All segments</strong>
              <div className="text-muted small">
                Click to add. Used segments are greyed out.
              </div>
            </div>

            <SegmentList
              segments={segments}
              usedKeys={usedKeys}
              onPick={handlePickFromList}
            />
          </Col>
        </Row>

        <div className="d-flex align-items-center gap-2 mt-3">
          <Button
            variant="primary"
            onClick={doSubmit}
            disabled={picked.length === 0}
          >
            Submit route
          </Button>
          <span className="text-muted small">
            You can submit any time; an invalid or incomplete route scores zero.
          </span>
        </div>
      </Card.Body>
    </Card>
  );
}

export default PlanningPhase;