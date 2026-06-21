import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as apiService from '../api/apiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        if (savedToken) {
          setToken(savedToken);
          const res = await apiService.getCurrentUser();
          setUser(res.data.user);
        }
      } catch {
        await AsyncStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const register = async (email, password, name) => {
    await apiService.register(email, password, name);
    // El registro solo crea el usuario, luego el usuario debe hacer login
  };

  const login = async (email, password) => {
    const res = await apiService.login(email, password);
    const newToken = res.data.user.idToken;
    const userData = res.data.user;
    await AsyncStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const sendOtp = async (email) => {
    await apiService.sendOtp(email);
  };

  const verifyOtp = async (email, code) => {
    const res = await apiService.verifyOtp(email, code);
    const newToken = res.data.customToken;
    const userData = res.data.user;
    await AsyncStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, register, login, sendOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
