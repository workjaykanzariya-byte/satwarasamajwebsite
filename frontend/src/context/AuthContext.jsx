import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('satvara_admin_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchAdminProfile();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setAdmin(null);
      setLoading(false);
    }
  }, [token]);

  const fetchAdminProfile = async () => {
    try {
      const res = await axios.get('/api/v1/auth/me');
      if (res.data.success) {
        setAdmin(res.data.admin);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Fetch Admin profile error:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (email, password) => {
    const res = await axios.post('/api/v1/auth/login', { email, password });
    if (res.data.success) {
      const jwtToken = res.data.token;
      localStorage.setItem('satvara_admin_token', jwtToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      setToken(jwtToken);
      setAdmin(res.data.admin);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('satvara_admin_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken('');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
