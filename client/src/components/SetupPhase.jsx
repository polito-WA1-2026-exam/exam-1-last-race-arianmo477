import { Card, Button } from 'react-bootstrap';
import NetworkMap from './NetworkMap.jsx';

function SetupPhase({ network, onReady }) {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Study the network</Card.Title>
        <Card.Text className="text-muted">
          Memorise the lines and connections. In the next phase the lines
          disappear and you have 90 seconds to rebuild your route.
        </Card.Text>

        <div className="my-3">
          <NetworkMap stations={network.stations} lines={network.lines} showLines={true} />
        </div>

        <Button variant="success" onClick={onReady}>
          I&apos;m ready — start planning
        </Button>
      </Card.Body>
    </Card>
  );
}

export default SetupPhase;