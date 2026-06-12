import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const rawToken = localStorage.getItem('sslp_token');
      if (!rawToken) {
        setLoading(false);
        return;
      }

      setToken(rawToken);
      try {
        const { data } = await getMe();
        setUser(data.user);
      } catch {
        localStorage.removeItem('sslp_token');
        localStorage.removeItem('sslp_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('sslp_user', JSON.stringify(user));
    else localStorage.removeItem('sslp_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('sslp_token', token);
    else localStorage.removeItem('sslp_token');
  }, [token]);

  const login = (u, t) => {
    setUser(u);
    setToken(t);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
