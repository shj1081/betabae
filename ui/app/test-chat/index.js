import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatRoomScreen from './screens/ChatRoomScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoadingIndicator from './components/LoadingIndicator';

// Main App Component
const TestChatApp = () => {
  const [activeScreen, setActiveScreen] = useState('Login');
  const [chatRoomParams, setChatRoomParams] = useState(null);
  const router = useRouter();
  
  // Custom navigation functions for our screens
  const navigation = {
    navigate: (screenName, params) => {
      if (screenName === 'ChatRoom') {
        setActiveScreen('ChatRoom');
        setChatRoomParams(params);
      } else if (screenName === 'Login' || screenName === 'Register') {
        setActiveScreen(screenName);
      } else if (screenName === 'Profile') {
        setActiveScreen('Profile');
      }
    },
    goBack: () => {
      setActiveScreen('ChatList');
      setChatRoomParams(null);
    },
    setOptions: () => {}, // Stub for compatibility
  };
  
  // Render the appropriate screen based on auth state and active screen
  const renderScreen = (isAuthenticated, loading) => {
    if (loading) {
      return <LoadingIndicator />;
    }
    
    // Always check authentication first
    if (!isAuthenticated) {
      console.log('Rendering login/register screen');
      return activeScreen === 'Register' ? 
        <RegisterScreen navigation={navigation} /> : 
        <LoginScreen navigation={navigation} />;
    }
    
    switch (activeScreen) {
      case 'ChatList':
        return <ChatListScreen navigation={navigation} />;
      case 'ChatRoom':
        return chatRoomParams ? 
          <ChatRoomScreen route={{ params: chatRoomParams }} navigation={navigation} /> : 
          <ChatListScreen navigation={navigation} />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} />;
      default:
        return <ChatListScreen navigation={navigation} />;
    }
  };
  
  // Custom header based on active screen
  const renderHeader = (isAuthenticated) => {
    if (!isAuthenticated) {
      return activeScreen === 'Login' ? 'Login' : 'Register';
    }
    
    switch (activeScreen) {
      case 'ChatList':
        return 'Chats';
      case 'ChatRoom':
        return chatRoomParams?.chatPartner?.name || 'Chat';
      case 'Profile':
        return 'Profile';
      default:
        return 'Test Chat';
    }
  };
  
  // Custom bottom tab bar
  const renderTabBar = (isAuthenticated) => {
    if (!isAuthenticated || activeScreen === 'ChatRoom') {
      return null;
    }
    
    return (
      <View style={styles.tabBar}>
        <View 
          style={[styles.tabItem, activeScreen === 'ChatList' && styles.activeTab]}
          onTouchEnd={() => setActiveScreen('ChatList')}
        >
          <Ionicons 
            name={activeScreen === 'ChatList' ? 'chatbubbles' : 'chatbubbles-outline'} 
            size={24} 
            color={activeScreen === 'ChatList' ? '#0066cc' : 'gray'} 
          />
          <Text style={[styles.tabText, activeScreen === 'ChatList' && styles.activeTabText]}>Chats</Text>
        </View>
        
        <View 
          style={[styles.tabItem, activeScreen === 'Profile' && styles.activeTab]}
          onTouchEnd={() => setActiveScreen('Profile')}
        >
          <Ionicons 
            name={activeScreen === 'Profile' ? 'person' : 'person-outline'} 
            size={24} 
            color={activeScreen === 'Profile' ? '#0066cc' : 'gray'} 
          />
          <Text style={[styles.tabText, activeScreen === 'Profile' && styles.activeTabText]}>Profile</Text>
        </View>
      </View>
    );
  };
  
  const AppContent = () => {
    const { isAuthenticated, loading } = useAuth();
    
    // Handle authentication state changes
    useEffect(() => {
      // If authenticated, allow navigation to protected screens
      if (isAuthenticated) {
        // Only navigate to ChatList if coming from auth screens
        if (activeScreen === 'Login' || activeScreen === 'Register') {
          console.log('User authenticated, navigating to ChatList');
          setActiveScreen('ChatList');
        }
      } else {
        // If not authenticated, force login screen
        if (activeScreen !== 'Login' && activeScreen !== 'Register') {
          console.log('Not authenticated, redirecting to login');
          setActiveScreen('Login');
        }
      }
    }, [isAuthenticated, activeScreen]);
    
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          {activeScreen === 'ChatRoom' && (
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color="#0066cc" 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            />
          )}
          <Text style={styles.headerTitle}>{renderHeader(isAuthenticated)}</Text>
        </View>
        
        <View style={styles.content}>
          {renderScreen(isAuthenticated, loading)}
        </View>
        
        {renderTabBar(isAuthenticated)}
      </View>
    );
  };
  
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#0066cc',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: 'gray',
  },
  activeTabText: {
    color: '#0066cc',
  },
});

export default TestChatApp;
