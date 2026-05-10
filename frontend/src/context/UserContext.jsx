import { useCallback, useEffect, useState } from 'react';
import { getMe } from '../api/api';
import { UserContext } from './UserContextObject';

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('wisora_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wisora_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('wisora_user');
    }
  }, [currentUser]);

  const login = (data) => {
    // Expects { token, user } from backend
    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
    }
  };

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('wisora_user');
    localStorage.removeItem('token');
  }, []);

  // Sync with backend on startup
  useEffect(() => {
    const syncUser = async () => {
      const token = localStorage.getItem('token');
      if (token && currentUser) {
        try {
          const res = await getMe();
          if (res.data.user) {
            setCurrentUser(res.data.user);
          }
        } catch (err) {
          if (err.response?.status === 401) {
            logout();
          }
        }
      }
    };
    syncUser();
  }, [currentUser, logout]);

  const updateUser = (data) =>
    setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));

  return (
    <UserContext.Provider value={{ currentUser, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}
