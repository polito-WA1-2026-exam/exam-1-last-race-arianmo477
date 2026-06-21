import { useState, useEffect } from 'react';
import API from '../API.js';
import { AuthContext } from './auth-context.js';

// Provider wraps the app and owns the auth state.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // { id, username } or null
  const [loading, setLoading] = useState(true); // true until first session check resolves

  // On first render, restore any existing session from the cookie.
  useEffect(() => {
    API.getCurrentSession()
      .then((u) => setUser(u))      // u is the user, or null if not logged in
      .catch(() => setUser(null))   // network/server error -> treat as logged out
      .finally(() => setLoading(false));
  }, []);

  // Log in: call the API, store the returned user.
  async function login(credentials) {
    const u = await API.logIn(credentials);
    setUser(u);
    return u;
  }

  // Log out: clear server session and local state.
  async function logout() {
    await API.logOut();
    setUser(null);
  }

  const value = { user, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}