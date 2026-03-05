// src/utils/storage.js - FIXED VERSION
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeData = async (key, value) => {
  try {
    if (typeof value === 'string') {
      // String ko directly save karo
      await AsyncStorage.setItem(key, value);
    } else {
      // Object ko stringify karo
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
    console.log(`✅ Stored: ${key}`);
  } catch (error) {
    console.log(`❌ Error storing ${key}:`, error);
  }
};

export const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    
    // Check if it's JSON
    if (value.startsWith('{') || value.startsWith('[')) {
      return JSON.parse(value);
    }
    return value; // Plain string return karo
  } catch (error) {
    console.log(`❌ Error getting ${key}:`, error);
    return null;
  }
};

export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`✅ Removed: ${key}`);
  } catch (error) {
    console.log(`❌ Error removing ${key}:`, error);
  }
};

export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('✅ Storage cleared');
  } catch (error) {
    console.log('❌ Error clearing storage:', error);
  }
};