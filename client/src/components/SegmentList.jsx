import { ListGroup, Badge, Form, InputGroup } from 'react-bootstrap';
import { useState, useMemo } from 'react';

function segKey(seg) {
  return seg.fromId < seg.toId
    ? `${seg.fromId}-${seg.toId}`
    : `${seg.toId}-${seg.fromId}`;
}

function SegmentList({ segments = [], usedKeys = new Set(), onPick, disabled = false }) {
  const [filter, setFilter] = useState('');

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return segments;
    return segments.filter(
      (s) => s.from.toLowerCase().includes(q) || s.to.toLowerCase().includes(q)
    );
  }, [filter, segments]);

  return (
    <div>
      <InputGroup size="sm" className="mb-2">
        <InputGroup.Text>🔎</InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Filter by station name…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </InputGroup>

      <div
        className="border rounded-3"
        style={{ maxHeight: '340px', overflowY: 'auto' }}
      >
        <ListGroup variant="flush">
          {shown.map((seg) => {
            const used = usedKeys.has(segKey(seg));
            const selectable = !disabled && !used;
            return (
              <ListGroup.Item
                key={`${seg.fromId}-${seg.toId}`}
                action={selectable}
                disabled={!selectable}
                onClick={selectable ? () => onPick(seg) : undefined}
                className="d-flex justify-content-between align-items-center py-2"
              >
                <span className={used ? 'text-muted text-decoration-line-through' : ''}>
                  {seg.from} <span className="text-muted">→</span> {seg.to}
                </span>
                {used ? (
                  <Badge bg="secondary">used</Badge>
                ) : (
                  <Badge bg="success">add</Badge>
                )}
              </ListGroup.Item>
            );
          })}
          {shown.length === 0 && (
            <ListGroup.Item className="text-muted small">
              No segments match “{filter}”.
            </ListGroup.Item>
          )}
        </ListGroup>
      </div>
    </div>
  );
}

export default SegmentList;