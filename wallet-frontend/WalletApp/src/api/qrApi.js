import axiosInstance from './axiosConfig';

const qrApi = {
  // Generate personal QR
  generatePersonalQR: async () => {
    try {
      const response = await axiosInstance.post('/qr/generate-static');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Generate payment QR with amount
  generatePaymentQR: async (amount) => {
    try {
      const response = await axiosInstance.post('/qr/generate-payment', { amount });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Set UPI ID
  setUpiId: async (upiId) => {
    try {
      const response = await axiosInstance.post('/qr/set-upi', { upiId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Scan QR code
  scanQR: async (qrData) => {
    try {
      const response = await axiosInstance.post('/qr/scan', { qrData });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Make payment by QR
  payByQR: async (qrData, amount) => {
    try {
      const response = await axiosInstance.post('/payment/by-qr', {
        qrData,
        amount,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default qrApi;