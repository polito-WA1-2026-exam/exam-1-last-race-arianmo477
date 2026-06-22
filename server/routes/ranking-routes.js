
import express from 'express';
import { getRanking } from '../dao/game-dao.js';

const router = express.Router();

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authenticated.' });
}

router.get('/api/ranking', isLoggedIn, async (req, res) => {
  try {
    const ranking = await getRanking();
    res.json(ranking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load the ranking.' });
  }
});

export default router;