import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useMessages from '../hooks/useMessages';
import useConversations from '../hooks/useConversations';
import MessageBubble from '../components/MessageBubble';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import ConnectionStatus from '../components/ConnectionStatus';
import { useAuth } from '../contexts/AuthContext';

const ChatRoomScreen = ({ route, navigation }) => {
  const { conversationId, chatPartner } = route.params;
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  
  const { 
    messages, 
    loading, 
    error, 
    hasMore, 
    sendMessage, 
    loadMoreMessages 
  } = useMessages(conversationId);
  
  const { 
    resetUnreadCount,
    setActiveConversationId
  } = useConversations();
  
  const { user } = useAuth();
  
  // Set active conversation when entering the chat room
  // Note: The unread count is reset automatically when messages are fetched
  useEffect(() => {
    if (conversationId) {
      console.log('Setting active conversation:', conversationId);
      setActiveConversationId(conversationId);
      
      // The backend will automatically mark messages as read when we fetch messages
      // The resetUnreadCount is still needed to update the UI immediately
      resetUnreadCount(conversationId);
      
      // Clean up when leaving the chat room
      return () => {
        console.log('Clearing active conversation');
        setActiveConversationId(null);
      };
    }
  }, [conversationId, resetUnreadCount]); // Adding resetUnreadCount as dependency is safe now
  
  // Set up navigation header
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>
            {chatPartner.nickname || chatPartner.name}
          </Text>
        </View>
      ),
    });
  }, [navigation, chatPartner]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0 && flatListRef.current) {
      console.log('Scrolling to bottom with', messages.length, 'messages');
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages?.length]); // Use optional chaining to prevent errors
  
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    try {
      setSending(true);
      await sendMessage(messageText);
      setMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };
  
  const renderItem = ({ item }) => <MessageBubble message={item} />;
  
  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <TouchableOpacity 
        style={styles.loadMoreContainer} 
        onPress={loadMoreMessages}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#0066cc" />
        ) : (
          <Text style={styles.loadMoreText}>Load more messages</Text>
        )}
      </TouchableOpacity>
    );
  };
  
  if (loading && (!messages || messages.length === 0)) {
    return <LoadingIndicator />;
  }
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ConnectionStatus />
      <ErrorMessage message={error} />
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.messageId?.toString() || Math.random().toString()}
        renderItem={renderItem}
        inverted={true} // Display newest messages at the bottom
        ListFooterComponent={renderFooter}
        contentContainerStyle={[styles.messagesContainer, { flexGrow: 1 }]}
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
            </View>
          ) : null
        }
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSendMessage}
          disabled={sending || !messageText.trim()}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messagesContainer: {
    paddingVertical: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 200,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  loadMoreContainer: {
    padding: 10,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#0066cc',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#0066cc',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default ChatRoomScreen;
