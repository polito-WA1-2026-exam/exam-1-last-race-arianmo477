import { useContext } from 'react';
import { AuthContext } from './contexts/auth-context.js';

export function useAuth() {
  return useContext(AuthContext);
}