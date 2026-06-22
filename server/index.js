

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './auth/passport-config.js';

import authRoutes from './routes/auth-routes.js';
import networkRoutes from './routes/network-routes.js';
import gameRoutes from './routes/game-routes.js';
import rankingRoutes from './routes/ranking-routes.js';

const app = express();
const PORT = 3001;
const CLIENT_ORIGIN = 'http://localhost:5173'; // Vite dev server

// Parse JSON request bodies.
app.use(express.json());

// CORS: allow the React dev server origin and send/receive cookies.
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);


app.use(
  session({
    secret: 'last-race-secret-please-change',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' },
  })
);

// Passport must come after session so it can attach to the session.
app.use(passport.initialize());
app.use(passport.session());

// Mount API routes.
app.use(authRoutes);
app.use(networkRoutes);
app.use(gameRoutes);
app.use(rankingRoutes);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});