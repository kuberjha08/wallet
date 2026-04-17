import axios from 'axios';
import { TokenManager } from '../pages/LoginPage';

const API_BASE_URL = '';
// const API_BASE_URL = "http://localhost:8080"

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 120000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = TokenManager.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (import.meta.env.DEV) {
            console.log('API Request:', {
                url: config.url,
                method: config.method,
                data: config.data,
                headers: config.headers,
            });
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            console.log('API Error Response:', {
                data: error.response.data,
                status: error.response.status,
                headers: error.response.headers,
            });

            // Handle 401 Unauthorized
            if (error.response.status === 401) {
                TokenManager.clearTokens();
                window.location.href = '/admin/login';  // ✅ CHANGE: /admin/login
            }
        } else if (error.request) {
            console.log('API No Response:', error.request);
        } else {
            console.log('API Request Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;