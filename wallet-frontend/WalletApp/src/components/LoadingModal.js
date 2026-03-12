// components/LoadingModal.js
import React from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingModal = ({ visible = false, message = 'Loading...' }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.modalText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 200,
  },
  modalText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#1F2937',
    fontSize: 16,
  },
});

export default LoadingModal;