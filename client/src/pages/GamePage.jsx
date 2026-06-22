

import { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import API from '../API.js';
import PhaseStepper from '../components/PhaseStepper.jsx';
import SetupPhase from '../components/SetupPhase.jsx';
import PlanningPhase from '../components/PlanningPhase.jsx';
import ExecutionPhase from '../components/ExecutionPhase.jsx';
import ResultPhase from '../components/ResultPhase.jsx';

const PHASE_TAG = {
  setup: 'SETUP',
  planning: 'PLANNING',
  execution: 'EXECUTION',
  result: 'RESULT',
};

function GamePage() {
  const [phase, setPhase] = useState('setup');
  const [network, setNetwork] = useState(null);
  const [segments, setSegments] = useState(null);
  const [game, setGame] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([API.getNetwork(), API.getSegments()])
      .then(([net, segs]) => {
        if (cancelled) return;
        setNetwork(net);
        setSegments(segs);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the network. Please try again.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleReady() {
    setError('');
    setBusy(true);
    try {
      const started = await API.startGame();
      setGame(started);
      setPhase('planning');
    } catch {
      setError('Could not start a new game. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmitRoute(routeStationIds) {
    setError('');
    setBusy(true);
    try {
      const res = await API.submitRoute(game.gameId, routeStationIds);
      setResult(res);
      setPhase('execution');
    } catch {
      setError('Could not submit the route. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function handleExecutionDone() {
    setPhase('result');
  }

  function handleNewGame() {
    setGame(null);
    setResult(null);
    setPhase('setup');
  }

  if (error) return <Alert variant="danger">{error}</Alert>;

  if (!network || !segments) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  let phaseEl;
  switch (phase) {
    case 'setup':
      phaseEl = <SetupPhase network={network} onReady={handleReady} disabled={busy} />;
      break;
    case 'planning':
      phaseEl = (
        <PlanningPhase
          game={game}
          stations={network.stations}
          segments={segments}
          onSubmit={handleSubmitRoute}
        />
      );
      break;
    case 'execution':
      phaseEl = <ExecutionPhase result={result} onDone={handleExecutionDone} />;
      break;
    case 'result':
      phaseEl = <ResultPhase result={result} onNewGame={handleNewGame} />;
      break;
    default:
      phaseEl = null;
  }

  return (
    <>
      <PhaseStepper current={phase} />
      
      {phaseEl}
    </>
  );
}

export default GamePage;