

import express from 'express';
import {
  createGame,
  getGameById,
  saveSegments,
  finishGame,
} from '../dao/game-dao.js';
import { getStations, getAdjacency } from '../dao/network-dao.js';
import { getRandomEvent } from '../dao/event-dao.js';
import { assignStartAndDest, computeScore, START_COINS } from '../services/game-logic.js';
import { validateRoute } from '../services/route-validator.js';

const router = express.Router();

const PLANNING_SECONDS = 90;
const GRACE_SECONDS = 2;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authenticated.' });
}

// Start a new game.
router.post('/api/games', isLoggedIn, async (req, res) => {
  try {
    const stations = await getStations();
    const adj = await getAdjacency();
    const stationIds = stations.map((s) => s.id);

    const { startId, destId } = assignStartAndDest(adj, stationIds);
    const game = await createGame(req.user.id, startId, destId);

    const nameById = new Map(stations.map((s) => [s.id, s.name]));
    res.json({
      gameId: game.id,
      start: { id: startId, name: nameById.get(startId) },
      destination: { id: destId, name: nameById.get(destId) },
      startCoins: START_COINS,
      planningSeconds: PLANNING_SECONDS,
      startedAt: game.started_at,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start a new game.' });
  }
});

// Submit a route for an existing game.
router.post('/api/games/:id/route', isLoggedIn, async (req, res) => {
  try {
    const gameId = Number(req.params.id);
    const { route } = req.body;

    const game = await getGameById(gameId);

    if (!game || game.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Game not found.' });
    }
    if (game.status !== 'planning') {
      return res.status(409).json({ error: 'Game already completed.' });
    }

    const elapsedSeconds = (Date.now() - new Date(game.started_at).getTime()) / 1000;
    const expired = elapsedSeconds > PLANNING_SECONDS + GRACE_SECONDS;

    const wellFormed =
      Array.isArray(route) && route.every((id) => Number.isInteger(id));

    const adj = await getAdjacency();
    let validation = { valid: false, reason: 'Time expired.' };
    if (!expired && wellFormed) {
      validation = validateRoute(adj, route, game.start_id, game.dest_id);
    } else if (!wellFormed) {
      validation = { valid: false, reason: 'Malformed route.' };
    }

    if (!validation.valid) {
      await finishGame(gameId, 0);        // store score 0
      return res.json({
        valid: false,
        reason: validation.reason,
        score: 0,
        steps: [],                         // no steps -> Execution shows nothing
      });
    }

    const stations = await getStations();
    const nameById = new Map(stations.map((s) => [s.id, s.name]));

    const resolvedSteps = [];
    const stepResults = [];
    const appliedEvents = [];
    let runningTotal = START_COINS;

    for (let i = 0; i < route.length - 1; i++) {
      const fromId = route[i];
      const toId = route[i + 1];
      const event = await getRandomEvent();

      runningTotal += event.effect;
      appliedEvents.push(event);
      resolvedSteps.push({ fromId, toId, eventId: event.id });
      stepResults.push({
        step: i,
        from: nameById.get(fromId),
        to: nameById.get(toId),
        event: { description: event.description, effect: event.effect },
        runningTotal,
      });
    }

    const finalScore = computeScore(appliedEvents);
    await saveSegments(gameId, resolvedSteps);
    await finishGame(gameId, finalScore);

    res.json({
      valid: true,
      reason: 'OK',
      score: finalScore,
      steps: stepResults,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit the route.' });
  }
});

export default router;