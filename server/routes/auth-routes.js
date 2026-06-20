

import express from 'express';
import passport from '../auth/passport-config.js';

const router = express.Router();

// Log in. passport.authenticate runs the LocalStrategy; on success we
// establish the session with req.login and return the safe user object.
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

// Return the current user if logged in, else 401 so the client knows.
router.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) return res.json(req.user);
  return res.status(401).json({ error: 'Not authenticated.' });
});

// Log out: terminate the session.
router.delete('/api/sessions/current', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    return res.status(200).json({});
  });
});

export default router;