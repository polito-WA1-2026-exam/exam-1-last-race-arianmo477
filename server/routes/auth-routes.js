

import express from 'express';
import passport from '../auth/passport-config.js';

const router = express.Router();


router.post('/api/sessions', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Login failed.' });
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.json(user); // { id, username }
    });
  })(req, res, next);
});


router.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) return res.json(req.user);
  return res.status(401).json({ error: 'Not authenticated.' });
});


router.delete('/api/sessions/current', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    return res.status(200).json({});
  });
});

export default router;