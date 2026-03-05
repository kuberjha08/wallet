import React from 'react';
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

// Colors defined directly in the component to avoid dependency issues
const COLORS = {
  primary: '#4F46E5',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9CA3AF',
  dark: '#1F2937',
};

/**
 * LoadingModal Component
 * 
 * A reusable loading modal that displays a spinner with a message
 * 
 * @param {boolean} visible - Controls modal visibility
 * @param {string} message - Loading message to display
 * @param {boolean} transparent - Whether modal background is transparent
 * @param {string} size - Size of the activity indicator (small/large)
 */
const LoadingModal = ({ 
  visible = false, 
  message = 'Loading...', 
  transparent = true,
  size = 'large'
}) => {
  return (
    <Modal
      transparent={transparent}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {
        // Prevent closing on hardware back button press
        // You can add custom logic here if needed
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Activity Indicator / Spinner */}
          <ActivityIndicator 
            size={size} 
            color={COLORS.primary} 
          />
          
          {/* Loading Message */}
          <Text style={styles.modalText}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalView: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    minWidth: 200, // Minimum width for the modal
  },
  modalText: {
    marginTop: 15,
    textAlign: 'center',
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoadingModal;