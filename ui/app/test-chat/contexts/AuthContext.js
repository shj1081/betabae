import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import socketService from '../services/socket';
import notificationService from '../services/notification';

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && user) {
        // Reconnect socket when app comes to foreground
        socketService.connect();
      } else if (nextAppState.match(/inactive|background/) && user) {
        // Optionally disconnect socket when app goes to background
        // socketService.disconnect();
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user]);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        console.log('Checking if user is already logged in...');
        // Check if there's user data in storage
        const userData = await AsyncStorage.getItem('user');
        console.log('User data from storage:', userData);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          
          // If the stored user data doesn't have an ID, try to fetch it
          if (!parsedUser.id) {
            console.warn('User data found but missing ID, will try to fetch it');
            // We'll attempt to get the ID when we connect the socket
          } else {
            console.log('Using stored user ID:', parsedUser.id);
          }
          
          console.log('User found in storage, logging in:', parsedUser);
          setUser(parsedUser);
          
          // Do NOT connect to socket here - we'll connect only after explicit login
          // Initialize notifications
          if (Platform.OS !== 'web') {
            await notificationService.initialize();
          }
        } else {
          console.log('No user found in storage, user is not authenticated');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setError('Failed to authenticate');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    // Clean up when component unmounts
    return () => {
      if (socketService.isConnected) {
        socketService.disconnect();
      }
      notificationService.cleanup();
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Logging in with:', email);
      const response = await authAPI.login(email, password);
      console.log('Login response:', response);
      
      // Initialize with basic user data from login response
      let userData = {
        email: email,
        name: email.split('@')[0], // Use email username as fallback name
      };
      
      // Connect socket with the new session cookie
      socketService.connect();
      console.log('Socket connected after login');
      
      // Call the user profile API to get the user ID
      try {
        console.log('Calling user/profile API to get user ID...');
        const profileResponse = await authAPI.getUserProfile();
        
        // Log every property of the response for debugging
        console.log('Profile API response type:', typeof profileResponse);
        console.log('Profile API response keys:', Object.keys(profileResponse));
        console.log('Profile API data type:', typeof profileResponse.data);
        console.log('Profile API data keys:', Object.keys(profileResponse.data));
        
        // Log the full response structure for debugging
        console.log('Full profile response:', JSON.stringify(profileResponse, null, 2));
        
        // Let's try to directly access the user ID from the response
        // First, log all possible paths to find the user ID
        console.log('Trying to find user ID in response...');
        console.log('profileResponse.data.user?.id:', profileResponse.data?.user?.id);
        console.log('profileResponse.data.data?.user?.id:', profileResponse.data?.data?.user?.id);
        
        // Based on your logs, the correct path is profileResponse.data.user.id
        let userId = null;
        let userInfo = null;
        
        // Use the correct path: profileResponse.data.user
        if (profileResponse?.data?.user?.id !== undefined) {
          console.log('Found user ID in profileResponse.data.user');
          userId = profileResponse.data.user.id;
          userInfo = profileResponse.data.user;
        } else {
          console.warn('Could not find user ID in profileResponse.data.user');
          // Log the full response again for debugging
          console.log('Full response structure:', JSON.stringify(profileResponse, null, 2));
        }
        
        if (userId !== null) {
          console.log('Got user ID from profile:', userId);
          
          // Update the user data with the ID
          userData.id = userId;
          
          // Also get other user info if available
          if (userInfo) {
            userData.email = userInfo.email || userData.email;
            userData.name = userInfo.legal_name || userData.name;
            console.log('Updated user data with profile info:', userData);
          }
        } else {
          console.warn('Could not find user ID in profile response');
        }
      } catch (error) {
        console.error('Error getting user profile:', error);
      }
      
      // If we still don't have a user ID, use a fallback
      if (!userData.id) {
        console.warn('Using fallback user ID');
        userData.id = 1; // Fallback ID as last resort
      }
      
      console.log('Final user data:', userData);
      
      // Save user data to storage - use 'user' key to match what's checked in checkAuthStatus
      console.log('Saving user data to AsyncStorage with key \'user\':', userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Initialize notifications if needed
      if (Platform.OS !== 'web') {
        await notificationService.initialize();
      }
      
      // Set the user in state
      setUser(userData);
      setLoading(false);
      
      // Return the user data for the caller
      return userData;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register(userData);
      return response;
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would call the API
      // await authAPI.logout();
      
      // Clear AsyncStorage first
      await AsyncStorage.removeItem('user');
      
      // Disconnect socket
      socketService.disconnect();
      
      // Clean up notifications
      notificationService.cleanup();
      
      // Clear user data in state last
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
