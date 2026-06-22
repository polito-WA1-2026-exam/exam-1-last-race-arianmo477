

import express from 'express';
import { getFullNetwork, getSegments } from '../dao/network-dao.js';
import { getEvents } from '../dao/event-dao.js';

const router = express.Router();

// Guard: only authenticated requests may proceed, otherwise 401.
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authenticated.' });
}

router.get('/api/network', isLoggedIn, async (req, res) => {
  try {
    const network = await getFullNetwork();
    res.json(network);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load the network.' });
  }
});

router.get('/api/network/segments', isLoggedIn, async (req, res) => {
  try {
    const segments = await getSegments();
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load the segments.' });
  }
});


router.get('/api/events', async (req, res) => {
  try {
    const events = await getEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load the events.' });
  }
});

export default router;