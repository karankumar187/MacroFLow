import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Attach token from localStorage on init
const token = localStorage.getItem('macroflow_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// ============ AUTH ============
export const authSignup = (name, email, password) =>
  api.post('/auth/signup', { name, email, password });

export const authLogin = (email, password) =>
  api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

// ============ USERS ============
export const createOrUpdateUser = (data) => api.post('/users', data);
export const getUser = () => api.get('/auth/me');

// ============ LOGS ============
export const getTodayLog = (userId) => api.get(`/logs/today/${userId}`);
export const getLogs = (userId, startDate, endDate) =>
  api.get(`/logs/${userId}?startDate=${startDate}&endDate=${endDate}`);
export const parseAndLogFood = (userId, text) =>
  api.post('/logs/text', { userId, text });
export const uploadFoodPhoto = (userId, file) => {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('userId', userId);
  return api.post('/logs/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteMeal = (logId, mealId) =>
  api.delete(`/logs/${logId}/meals/${mealId}`);

// ============ CHAT ============
export const sendChatMessage = (userId, message) =>
  api.post('/chat', { userId, message });

export default api;
