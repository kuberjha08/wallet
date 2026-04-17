import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://13.233.173.32:8080';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
// axiosInstance.interceptors.request.use(
//   async (config) => {
//     console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    
//     let token = await AsyncStorage.getItem('userToken');
//     console.log('🔑 Raw token from storage:', token);
    
//     if (token) {
//       // Token ke around quotes hain to remove karo
//       token = token.replace(/^"|"$/g, ''); // Remove leading/trailing quotes
//       console.log('🔑 Cleaned token:', token.substring(0, 20) + '...');
      
//       config.headers.Authorization = `Bearer ${token}`;
//       console.log('✅ Authorization header:', config.headers.Authorization);
//     } else {
//       console.log('❌ No token found!');
//     }
    
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// axiosConfig.js me direct AsyncStorage use karo

axiosInstance.interceptors.request.use(
  async (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    
    // Direct AsyncStorage use karo
    const token = await AsyncStorage.getItem('userToken');
    console.log('🔑 Raw token:', token);
    
    if (token) {
      // Clean token if it has quotes
      const cleanToken = token.replace(/^"|"$/g, '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
      console.log('✅ Auth header set');
    }
    
    return config;
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status}`);
    return response;
  },
  async (error) => {
    console.log('❌ Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 403) {
      console.log('🚫 403 Forbidden - Token issue!');
      const token = await AsyncStorage.getItem('userToken');
      console.log('Current token:', token ? 'Present' : 'Missing');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;