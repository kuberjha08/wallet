import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../utils/constants';

const CustomButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  type = 'primary', 
  size = 'large', 
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.gray;
    switch (type) {
      case 'primary':
        return COLORS.primary;
      case 'secondary':
        return COLORS.secondary;
      case 'danger':
        return COLORS.danger;
      default:
        return COLORS.primary;
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'medium':
        return 48;
      case 'large':
        return 56;
      default:
        return 56;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          height: getHeight(),
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomButton;