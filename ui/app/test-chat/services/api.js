import axios from 'axios';
import { Platform } from 'react-native';

// Base URL for API requests - use different URL for Android emulator
const API_BASE_URL = Platform.OS === 'web' ? 'http://localhost:3000' : 'http://10.0.2.2:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Always send cookies with requests for authentication
});

// Authentication API
const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Get current user information
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Get user profile information
  getUserProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {ㅈ
      throw error.response?.data || error;
    }
  },
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Chat API
const chatAPI = {
  getConversations: async () => {
    try {
      const response = await api.get('/chat/conversations');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  getMessages: async (conversationId, limit = 20, before) => {
    try {
      let url = `/chat/conversations/${conversationId}/messages?limit=${limit}`;
      if (before) {
        url += `&before=${before}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  sendTextMessage: async (conversationId, messageText) => {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
        messageText,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  sendImageMessage: async (conversationId, imageFile, messageText) => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      if (messageText) {
        formData.append('messageText', messageText);
      }
      
      const response = await api.post(
        `/chat/conversations/${conversationId}/messages/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  // Note: The backend automatically marks messages as read when fetching them
  // There is no separate endpoint for marking messages as read
  // The unread count is reset when getMessages is called
};

export { authAPI, chatAPI };
