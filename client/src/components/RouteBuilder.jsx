import { Button, Badge, Stack } from 'react-bootstrap';

function RouteBuilder({ pickedSegments = [], onUndo, onReset, disabled = false }) {
  const hasAny = pickedSegments.length > 0;
  const canEdit = !disabled && hasAny;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong>Your route</strong>
        <Badge bg="success" pill>
          {pickedSegments.length} segment{pickedSegments.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <div
        className="border rounded-3 p-2 mb-3 bg-light"
        style={{ minHeight: '54px', maxHeight: '140px', overflowY: 'auto' }}
      >
        {!hasAny ? (
          <span className="text-muted small">
            No segments yet. Click stations on the map or pick from the list.
          </span>
        ) : (
          <ol className="mb-0 ps-3 small">
            {pickedSegments.map((seg, i) => (
              <li key={i} className="mb-1">
                {seg.from} <span className="text-muted">→</span> {seg.to}
              </li>
            ))}
          </ol>
        )}
      </div>

      <Stack direction="horizontal" gap={2}>
        <Button variant="outline-secondary" size="sm" onClick={onUndo} disabled={!canEdit}>
          ↶ Undo
        </Button>
        <Button variant="outline-danger" size="sm" onClick={onReset} disabled={!canEdit}>
          ✕ Reset
        </Button>
      </Stack>
    </div>
  );
}

export default RouteBuilder;