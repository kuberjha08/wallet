import axios from 'axios';
import { TokenManager } from '../pages/LoginPage';

const API_BASE_URL = 'http://16.171.153.74:8080';
// const API_BASE_URL = "http://localhost:8080"

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 120000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Set to true if you need to send cookies
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = TokenManager.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log requests in development
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
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Error Response:', {
                data: error.response.data,
                status: error.response.status,
                headers: error.response.headers,
            });

            // Handle 401 Unauthorized
            if (error.response.status === 401) {
                TokenManager.clearTokens();
                window.location.href = '/login';
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('API No Response:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('API Request Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;