import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // App start hote hi token check karo
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      console.log('🔍 [Auth] Loading stored data...');
      
      // Direct AsyncStorage use karo
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      console.log('🔑 [Auth] Stored token:', token ? 'Present' : 'Missing');
      console.log('👤 [Auth] Stored user:', userDataString ? 'Present' : 'Missing');
      
      if (token && userDataString) {
        // User data ko parse karo (kyonki yeh JSON string hai)
        const userData = JSON.parse(userDataString);
        
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ [Auth] User authenticated from storage');
      } else {
        console.log('❌ [Auth] No stored credentials found');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.log('❌ [Auth] Error loading stored data:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (mobile, mpin) => {
    try {
      setIsLoading(true);
      console.log('🔑 [Auth] Logging in with:', mobile);
      
      const response = await authApi.loginWithMpin(mobile, mpin);
      console.log('✅ [Auth] Login response:', response);
      
      const token = response.token;
      const userData = response.user;
      
      // Token ko DIRECTLY save karo (bina JSON.stringify ke)
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      
      // User data ko JSON.stringify karo (kyonki yeh object hai)
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      
      if (response.permanentToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.PERMANENT_TOKEN, response.permanentToken);
      }
      
      // Verify token saved
      const savedToken = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      console.log('✅ [Auth] Token saved:', savedToken ? 'Yes' : 'No');
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, data: response };
    } catch (error) {
      console.log('❌ [Auth] Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('🔑 [Auth] Logging out...');
      
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.PERMANENT_TOKEN,
        STORAGE_KEYS.USER_MOBILE,
      ]);
      
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ [Auth] Logout successful');
    } catch (error) {
      console.log('❌ [Auth] Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const newUserData = { ...user, ...updatedData };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUserData));
      setUser(newUserData);
      return { success: true };
    } catch (error) {
      console.log('❌ [Auth] Update user error:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        updateUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
};