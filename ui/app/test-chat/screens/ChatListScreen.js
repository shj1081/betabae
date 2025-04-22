import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import ConnectionStatus from '../components/ConnectionStatus';
import { useAuth } from '../contexts/AuthContext';
import useConversations from '../hooks/useConversations';
import ConversationItem from '../components/ConversationItem';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';

const ChatListScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { 
    conversations, 
    totalUnreadCount, 
    loading, 
    error, 
    fetchConversations 
  } = useConversations();

  // Debug conversations data
  useEffect(() => {
    console.log('Conversations data:', conversations);
    console.log('Conversations length:', conversations ? conversations.length : 'undefined');
  }, [conversations]);

  useEffect(() => {
    // Set up navigation header
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={styles.headerTitle}>Chats</Text>
          {totalUnreadCount > 0 && (
            <View style={styles.totalUnreadBadge}>
              <Text style={styles.totalUnreadText}>{totalUnreadCount}</Text>
            </View>
          )}
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, totalUnreadCount, logout]);

  const handleRefresh = () => {
    fetchConversations();
  };

  const handleConversationPress = (conversation) => {
    navigation.navigate('ChatRoom', { 
      conversationId: conversation.conversationId,
      chatPartner: conversation.chatPartner,
    });
  };

  if (loading && (!conversations || conversations.length === 0)) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <ConnectionStatus />
      <ErrorMessage message={error} />
      
      {!conversations || conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>Your chats will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.conversationId.toString()}
          renderItem={({ item }) => (
            <ConversationItem 
              conversation={item} 
              onPress={() => handleConversationPress(item)} 
            />
          )}
          refreshing={loading}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalUnreadBadge: {
    position: 'absolute',
    top: -5,
    right: -20,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  totalUnreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginRight: 15,
  },
  logoutText: {
    color: '#0066cc',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ChatListScreen;
