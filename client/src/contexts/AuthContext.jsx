import { useState, useEffect } from 'react';
import API from '../API.js';
import { AuthContext } from './auth-context.js';


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      
  const [loading, setLoading] = useState(true); 

  // On first render, restore any existing session from the cookie.
  useEffect(() => {
    API.getCurrentSession()
      .then((u) => setUser(u))      
      .catch(() => setUser(null))   
      .finally(() => setLoading(false));
  }, []);

  
  async function login(credentials) {
    const u = await API.logIn(credentials);
    setUser(u);
    return u;
  }


  async function logout() {
    await API.logOut();
    setUser(null);
  }

  const value = { user, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}