import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LIGHT_COLORS = {
  primary: '#4F46E5',
  secondary: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  success: '#10B981',
  dark: '#1F2937',
  light: '#F9FAFB',
  gray: '#9CA3AF',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F3F4F6',
  card: '#FFFFFF',
  text: '#1F2937',
  border: '#E5E7EB',
};

export const DARK_COLORS = {
  primary: '#6366F1',
  secondary: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  success: '#10B981',
  dark: '#F9FAFB',
  light: '#1F2937',
  gray: '#9CA3AF',
  white: '#1F2937',
  black: '#F9FAFB',
  background: '#111827',
  card: '#1F2937',
  text: '#F9FAFB',
  border: '#374151',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useColorScheme(); 
  const [isDarkMode, setIsDarkMode] = useState(deviceColorScheme === 'dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          setIsDarkMode(deviceColorScheme === 'dark');
        }
      } catch (error) {
        setIsDarkMode(deviceColorScheme === 'dark');
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme === null) {
          setIsDarkMode(deviceColorScheme === 'dark');
        }
      } catch (_) {}
    })();
  }, [deviceColorScheme]);

  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const setTheme = async (dark) => {
    setIsDarkMode(dark);
    await AsyncStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
