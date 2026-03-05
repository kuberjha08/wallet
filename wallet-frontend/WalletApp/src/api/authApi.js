import axiosInstance from './axiosConfig';

const authApi = {
  // Send OTP for login/registration
  sendOtp: async (mobile) => {
    console.log('📱 [API] Send OTP called with mobile:', mobile);
    try {
      console.log('📤 [API] Sending OTP request to /users/send-otp');
      const response = await axiosInstance.post('/users/send-otp', { mobile });
      console.log('✅ [API] Send OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [API] Send OTP error:', error.response?.data || error.message);
      console.log('🔍 [API] Full error object:', error);
      throw error.response?.data || error.message;
    }
  },

  // Verify OTP
  verifyOtp: async (mobile, otp, tempToken) => {
    console.log('📱 [API] Verify OTP called with:', { mobile, otp, tempToken });
    try {
      console.log('📤 [API] Sending verify OTP request to /users/verify-otp');
      const response = await axiosInstance.post('/users/verify-otp', {
        mobile,
        otp,
        tempToken,
      });
      console.log('✅ [API] Verify OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [API] Verify OTP error:', error.response?.data || error.message);
      console.log('🔍 [API] Full error object:', error);
      throw error.response?.data || error.message;
    }
  },

  // Register user (only name needed, no MPIN)
  register: async (mobile, name) => {
    console.log('📱 [API] Register called with:', { mobile, name });
    try {
      console.log('📤 [API] Sending register request to /users/register');
      const response = await axiosInstance.post('/users/register', {
        mobile,
        name,
      });
      console.log('✅ [API] Register response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [API] Register error:', error.response?.data || error.message);
      console.log('🔍 [API] Full error object:', error);
      throw error.response?.data || error.message;
    }
  },

  // Set MPIN (separate step after registration)
  setMpin: async (token, mpin) => {
    console.log('📱 [API] Set MPIN called with:', { token, mpin });
    try {
      console.log('📤 [API] Sending set MPIN request to /users/set-mpin');
      const response = await axiosInstance.post('/users/set-mpin', {
        token,
        mpin,
      });
      console.log('✅ [API] Set MPIN response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [API] Set MPIN error:', error.response?.data || error.message);
      console.log('🔍 [API] Full error object:', error);
      throw error.response?.data || error.message;
    }
  },

  // Login with MPIN
  loginWithMpin: async (mobile, mpin) => {
    console.log('📱 [API] Login with MPIN called with:', { mobile, mpin: '****' });
    try {
      console.log('📤 [API] Sending login request to /users/login-mpin');
      const response = await axiosInstance.post('/users/login-mpin', {
        mobile,
        mpin,
      });
      console.log('✅ [API] Login response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [API] Login error:', error.response?.data || error.message);
      console.log('🔍 [API] Full error object:', error);
      throw error.response?.data || error.message;
    }
  },

  // Login with permanent token
  loginWithToken: async (mobile, permanentToken) => {
    console.log('📱 [API] Login with token called with:', { mobile, permanentToken });
    try {
      console.log('📤 [API] Sending token login request to /users/login-token');
      const response = await axiosInstance.post('/users/login-token', {
        mobile,
        permanentToken,
      });
      console.log('✅ [API] Token login response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [API] Token login error:', error.response?.data || error.message);
      console.log('🔍 [API] Full error object:', error);
      throw error.response?.data || error.message;
    }
  },

  // Forgot MPIN - Send OTP
  forgotMpinSendOtp: async (mobile) => {
    console.log('📱 [API] Forgot MPIN send OTP called with mobile:', mobile);
    try {
      console.log('📤 [API] Sending forgot MPIN OTP request to /users/forgot-mpin/send-otp');
      const response = await axiosInstance.post('/users/forgot-mpin/send-otp', {
        mobile,
      });
      console.log('✅ [API] Forgot MPIN send OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [API] Forgot MPIN send OTP error:', error.response?.data || error.message);
      console.log('🔍 [API] Full error object:', error);
      throw error.response?.data || error.message;
    }
  },

  // Reset MPIN via OTP
  resetMpin: async (mobile, otp, newMpin) => {
    console.log('📱 [API] Reset MPIN called with:', { mobile, otp, newMpin: '****' });
    try {
      console.log('📤 [API] Sending reset MPIN request to /users/forgot-mpin/reset');
      const response = await axiosInstance.post('/users/forgot-mpin/reset', {
        mobile,
        otp,
        newMpin,
      });
      console.log('✅ [API] Reset MPIN response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [API] Reset MPIN error:', error.response?.data || error.message);
      console.log('🔍 [API] Full error object:', error);
      throw error.response?.data || error.message;
    }
  },

  // Change MPIN (requires auth)
  changeMpin: async (oldMpin, newMpin) => {
    console.log('📱 [API] Change MPIN called with:', { oldMpin: '****', newMpin: '****' });
    try {
      console.log('📤 [API] Sending change MPIN request to /users/change-mpin');
      const response = await axiosInstance.post('/users/change-mpin', {
        oldMpin,
        newMpin,
      });
      console.log('✅ [API] Change MPIN response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [API] Change MPIN error:', error.response?.data || error.message);
      console.log('🔍 [API] Full error object:', error);
      throw error.response?.data || error.message;
    }
  },

  // Edit profile
  editProfile: async (profileData) => {
    console.log('📱 [API] Edit profile called with data:', profileData);
    try {
      console.log('📤 [API] Sending edit profile request to /users/profile');
      const response = await axiosInstance.put('/users/profile', profileData);
      console.log('✅ [API] Edit profile response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [API] Edit profile error:', error.response?.data || error.message);
      console.log('🔍 [API] Full error object:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default authApi;