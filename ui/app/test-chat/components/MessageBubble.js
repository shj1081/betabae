import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const MessageBubble = ({ message }) => {
  console.log('Rendering message:', message);
  const { user } = useAuth();
  
  // Handle potential null/undefined message or missing sender
  if (!message || !message.sender) {
    console.error('Invalid message object:', message);
    return null;
  }
  
  // Debug the message and user objects
  console.log('Message sender ID:', message.sender.id, 'type:', typeof message.sender.id);
  console.log('Current user ID:', user?.id, 'type:', typeof user?.id);
  
  // Get the sender ID from the message
  const senderId = Number(message.sender.id);
  
  // Get the current user ID from the AuthContext
  const userId = user?.id ? Number(user.id) : null;
  
  // Determine if the current user is the sender of this message
  // If user ID is not available, we'll use a fallback mechanism
  let isSender = false;
  
  if (userId !== null) {
    // Normal case - we have the user ID
    isSender = senderId === userId;
    console.log(`Message ${message.messageId || 'new'} from sender ${senderId}`);
    console.log(`Current user ID: ${userId}, isSender: ${isSender}`);
  } else {
    // Fallback - if user ID is not available, use a heuristic
    // This should only happen in rare cases
    console.warn('User ID not available, using fallback sender detection');
    isSender = senderId === 1; // Fallback based on your data
  }
  
  // This ensures consistent behavior regardless of user object state

  
  // This is just for debugging
  
  // Format the timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    // Handle both string timestamps and Date objects
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return '';
    }
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <View style={[styles.container, isSender ? styles.senderContainer : styles.receiverContainer]}>
      <View style={[styles.bubble, isSender ? styles.senderBubble : styles.receiverBubble]}>
        {message.attachment && (
          <Image 
            source={{ uri: message.attachment.url }} 
            style={styles.image}
            resizeMode="cover"
          />
        )}
        
        {message.messageText && (
          <Text style={[styles.text, isSender ? styles.senderText : styles.receiverText]}>
            {message.messageText}
          </Text>
        )}
        
        <Text style={[styles.time, isSender ? styles.senderTime : styles.receiverTime]}>
          {formatTime(message.sentAt)}
          {isSender && message.isRead && (
            <Text style={styles.readIndicator}> ✓</Text>
          )}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginHorizontal: 10,
    maxWidth: '80%',
  },
  senderContainer: {
    alignSelf: 'flex-end',
  },
  receiverContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    padding: 10,
    marginBottom: 2,
  },
  senderBubble: {
    backgroundColor: '#0066cc',
  },
  receiverBubble: {
    backgroundColor: '#e5e5ea',
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  senderText: {
    color: 'white',
  },
  receiverText: {
    color: 'black',
  },
  time: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  senderTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receiverTime: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  readIndicator: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
});

export default MessageBubble;
