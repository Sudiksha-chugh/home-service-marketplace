import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('pro_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [proProfile, setProProfile] = useState(() => {
    const savedPro = localStorage.getItem('pro_profile');
    return savedPro ? JSON.parse(savedPro) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('pro_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/professional/login', { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('pro_token', token);
        localStorage.setItem('pro_user', JSON.stringify(user));
        toast.success(`Welcome back, ${user.name}!`);
        return true;
      } else {
        toast.error(res.data.message || 'Login failed.');
        return false;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post('/professional/register', formData);
      if (res.data.success) {
        const { token, user, professional } = res.data;
        setToken(token);
        setUser(user);
        setProProfile(professional);
        localStorage.setItem('pro_token', token);
        localStorage.setItem('pro_user', JSON.stringify(user));
        if (professional) {
          localStorage.setItem('pro_profile', JSON.stringify(professional));
        }
        toast.success('Professional account created! Verification is pending.');
        return true;
      } else {
        toast.error(res.data.message || 'Registration failed.');
        return false;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setProProfile(null);
    localStorage.removeItem('pro_token');
    localStorage.removeItem('pro_user');
    localStorage.removeItem('pro_profile');
    toast.info('Logged out from Pro Portal.');
  };

  return (
    <AuthContext.Provider value={{ user, proProfile, setProProfile, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
