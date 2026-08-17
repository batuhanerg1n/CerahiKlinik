import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser || storedUser === 'undefined' || storedUser === 'null') {
      return null;
    }
    
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      return null;
    }
  });

  const login = (newToken, userData) => {
    if (newToken && userData) {
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.clear(); 
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);