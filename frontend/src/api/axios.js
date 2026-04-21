import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true, // Crucial for sending/receiving cookies with every request (Main Backend Auth)
});

// Response interceptor to handle unauthorized access across the app
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is due to unauthenticated status (401)
    if (error.response?.status === 401) {
      // If we are not already on the login page or register page, redirect
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;