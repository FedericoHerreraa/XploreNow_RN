import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://backend-apps-1.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (email, password, name) =>
  api.post('/auth/register', { email, password, ...(name ? { name } : {}) });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const sendOtp = (email) =>
  api.post('/auth/otp/send', { email });

export const verifyOtp = (email, code) =>
  api.post('/auth/otp/verify', { email, code });

export const getCurrentUser = () =>
  api.get('/auth/me');

// Profile
export const getProfile = () =>
  api.get('/profile/me');

export const updateProfile = (data) =>
  api.put('/profile/me', data);

// Actividades
export const getActividades = (params) =>
  api.get('/actividades', { params });

export const getActividadById = (id) =>
  api.get(`/actividades/${id}`);

export const getRecomendadas = (preferencias) =>
  api.get('/actividades/recomendadas', { params: { preferencias: preferencias.join(',') } });

// Reservas
export const getMisReservas = () =>
  api.get('/reservas');

export const crearReserva = (data) =>
  api.post('/reservas', data);

export const cancelarReserva = (id) =>
  api.patch(`/reservas/${id}/cancelar`);

// Reviews
export const postReview = (data) =>
  api.post('/usuarios/historial/review', data);

export const getReview = (userId, actividadId) =>
  api.get('/usuarios/historial/review', { params: { userId, actividadId } });

// Historial
export const getHistorial = (params) =>
  api.get('/usuarios/historial', { params });

// Favoritos
export const getMisFavoritos = () =>
  api.get('/favoritos');

export const addFavorito = (actividadId) =>
  api.post(`/favoritos/${actividadId}`);

export const removeFavorito = (actividadId) =>
  api.delete(`/favoritos/${actividadId}`);

export const checkFavorito = (actividadId) =>
  api.get(`/favoritos/${actividadId}/check`);

// Noticias
export const getNoticias = () =>
  api.get('/noticias');

// Notificaciones push
export const registerDevice = (pushToken, platform) =>
  api.post('/notifications/register-device', { pushToken, platform });

export const unregisterDevice = (pushToken) =>
  api.post('/notifications/unregister-device', { pushToken });
