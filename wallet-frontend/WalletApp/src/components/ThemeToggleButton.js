import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';

const ThemeToggleButton = ({ color }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const iconColor = color || colors.text;

  return (
    <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 10, padding: 4 }}>
      <Icon
        name={isDarkMode ? 'light-mode' : 'dark-mode'}
        size={24}
        color={iconColor}
      />
    </TouchableOpacity>
  );
};

export default ThemeToggleButton;
