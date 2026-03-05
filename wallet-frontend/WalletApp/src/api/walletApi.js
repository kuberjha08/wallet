import axiosInstance from './axiosConfig';

const walletApi = {
  // Get dashboard
  getDashboard: async () => {
    console.log('📤 [API] Fetching dashboard...');
    try {
      // Token automatically add hoga interceptor se
      const response = await axiosInstance.get('/dashboard');
      console.log('✅ [API] Dashboard response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [API] Dashboard error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  // Get wallet statement
  getStatement: async (userId) => {
    console.log('📤 [API] Fetching statement for user:', userId);
    try {
      const response = await axiosInstance.get(`/wallet/statement?userId=${userId}`);
      console.log('✅ [API] Statement response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [API] Statement error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  // Get transaction history
  getTransactionHistory: async (page = 0, size = 20) => {
    console.log('📤 [API] Fetching transactions:', { page, size });
    try {
      const response = await axiosInstance.get(`/payment/history?page=${page}&size=${size}`);
      console.log('✅ [API] Transactions response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [API] Transactions error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },
};

export default walletApi;