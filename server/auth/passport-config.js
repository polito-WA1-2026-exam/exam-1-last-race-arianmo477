

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getUserByUsername, getUserById, verifyPassword } from '../dao/user-dao.js';


passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await getUserByUsername(username);
      if (!user || !verifyPassword(user, password)) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      
      return done(null, { id: user.id, username: user.username });
    } catch (err) {
      return done(err);
    }
  })
);


passport.serializeUser((user, done) => {
  done(null, user.id);
});


passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    if (!user) return done(null, false);
    return done(null, { id: user.id, username: user.username });
  } catch (err) {
    return done(err);
  }
});

export default passport;