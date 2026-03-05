import axiosInstance from './axiosConfig';

const paymentApi = {
  // Send money by mobile number
  sendMoneyByMobile: async (mobile, amount, reference) => {
    try {
      const response = await axiosInstance.post('/payment/by-mobile', {
        mobile,
        amount,
        reference,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Request money
  requestMoney: async (mobile, amount, note) => {
    try {
      const response = await axiosInstance.post('/payment/request', {
        mobile,
        amount,
        note,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment requests
  getPaymentRequests: async () => {
    try {
      const response = await axiosInstance.get('/payment/requests');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Respond to payment request
  respondToRequest: async (requestId, action) => {
    try {
      const response = await axiosInstance.post(`/payment/requests/${requestId}/respond`, {
        action,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add money to wallet
  addMoney: async (amount) => {
    try {
      const response = await axiosInstance.post('/payment/add-money', { amount });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Withdraw money
  withdrawMoney: async (amount, bankAccount) => {
    try {
      const response = await axiosInstance.post('/payment/withdraw', {
        amount,
        bankAccount,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default paymentApi;