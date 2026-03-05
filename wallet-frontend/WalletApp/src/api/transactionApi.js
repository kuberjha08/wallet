import axiosInstance from './axiosConfig';

const transactionApi = {
  // Get transaction history from /transactions/history
  getTransactionHistory: async (page = 0, size = 20) => {
    console.log('📤 [API] Fetching transactions from /transactions/history:', { page, size });
    try {
      const response = await axiosInstance.get(`/transactions/history?page=${page}&size=${size}`);
      console.log('✅ [API] Transactions response:', response.data);
      
      // Remove duplicates based on amount, date, and type
      const uniqueTransactions = removeDuplicates(response.data.transactions || []);
      
      console.log(`📊 Original: ${response.data.transactions?.length}, After dedup: ${uniqueTransactions.length}`);
      
      return {
        transactions: uniqueTransactions,
        totalPages: response.data.totalPages || 1,
        totalTransactions: uniqueTransactions.length, // Sirf unique transactions count karo
        currentPage: response.data.currentPage || page,
        pageSize: size,
        stats: {
          totalReceived: calculateTotalReceived(uniqueTransactions),
          totalSent: calculateTotalSent(uniqueTransactions),
          totalTransactions: uniqueTransactions.length
        }
      };
    } catch (error) {
      console.error('❌ [API] Transactions error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  // Get transaction details
  getTransactionDetails: async (transactionId) => {
    console.log('📤 [API] Fetching transaction details:', transactionId);
    try {
      const response = await axiosInstance.get(`/transactions/${transactionId}`);
      console.log('✅ [API] Transaction details:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Transaction details error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },
};

// Stricter duplicate removal
const removeDuplicates = (transactions) => {
  const seen = new Map();
  
  return transactions.filter(tx => {
    // Use multiple fields to identify duplicate
    const key = `${tx.amount}_${tx.type}_${tx.date}`;
    
    if (seen.has(key)) {
      // Agar pehle se hai to mat lo
      console.log('Removing duplicate with key:', key);
      return false;
    }
    
    seen.set(key, true);
    return true;
  });
};

// Calculate total received amount
const calculateTotalReceived = (transactions) => {
  return transactions
    .filter(t => t.type === 'CREDIT')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
};

// Calculate total sent amount
const calculateTotalSent = (transactions) => {
  return transactions
    .filter(t => t.type === 'DEBIT')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
};

export default transactionApi;