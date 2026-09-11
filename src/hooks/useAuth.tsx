import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Agent } from '../types';
import { api } from '../services/api';

interface AuthContextValue { agent: Agent | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void> }
const AuthContext = createContext<AuthContextValue | null>(null);
let restoration: ReturnType<typeof api.refresh> | null = null;
export function AuthProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    restoration ??= api.refresh();
    restoration.then(session => { if (active) setAgent(session.agent); }).catch(() => { if (active) setAgent(null); }).finally(() => { if (active) setLoading(false); });
    const expire = () => setAgent(null);
    window.addEventListener('session-expired', expire);
    return () => { active = false; window.removeEventListener('session-expired', expire); };
  }, []);
  async function login(email: string, password: string) { const session = await api.login(email, password); setAgent(session.agent); }
  async function logout() { await api.logout(); setAgent(null); restoration = null; }
  return <AuthContext.Provider value={{ agent, loading, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('AuthProvider ausente.'); return context; }
