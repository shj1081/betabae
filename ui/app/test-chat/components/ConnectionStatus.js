import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import socketService from '../services/socket';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(socketService.isConnected);
  const [visible, setVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    // Set up interval to check connection status
    const checkConnectionInterval = setInterval(() => {
      const connectionStatus = socketService.isConnected;
      setIsConnected(connectionStatus);
      
      // Show the status indicator when disconnected
      if (!connectionStatus && !visible) {
        setVisible(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } 
      // Hide the status indicator when connected
      else if (connectionStatus && visible) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
        });
      }
    }, 1000);
    
    return () => clearInterval(checkConnectionInterval);
  }, [fadeAnim, visible]);
  
  if (!visible) return null;
  
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={[styles.indicator, isConnected ? styles.connected : styles.disconnected]} />
      <Text style={styles.text}>
        {isConnected ? 'Connected' : 'Reconnecting...'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f8f8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 999,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  connected: {
    backgroundColor: '#4CD964',
  },
  disconnected: {
    backgroundColor: '#FF3B30',
  },
  text: {
    fontSize: 12,
    color: '#666',
  },
});

export default ConnectionStatus;
