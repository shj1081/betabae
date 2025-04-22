import { useState, useEffect, useCallback, useRef } from 'react';
import { chatAPI } from '../services/api';
import socketService from '../services/socket';
import notificationService from '../services/notification';
import { useAuth } from '../contexts/AuthContext';

const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const activeConversationIdRef = useRef(null);
  
  // Set the active conversation ID (when user enters a chat room)
  const setActiveConversationId = useCallback((conversationId) => {
    activeConversationIdRef.current = conversationId;
  }, []);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await chatAPI.getConversations();
      console.log('Fetched conversations response:', response);
      
      // The API returns { message: '...', data: { conversations: [...], totalUnreadCount: number } }
      if (response && response.data && response.data.conversations) {
        console.log('Extracted conversations:', response.data.conversations);
        setConversations(response.data.conversations);
        setTotalUnreadCount(response.data.totalUnreadCount || 0);
      } else {
        console.warn('Unexpected response format from API:', response);
        // Ensure we at least have an empty array
        setConversations([]);
        setTotalUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setError('Failed to load conversations');
      // Ensure we at least have an empty array if the API call fails
      setConversations([]);
      setTotalUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update conversation with new message
  const updateConversationWithMessage = useCallback((message) => {
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.conversationId === message.conversationId) {
          // Update last message
          return {
            ...conv,
            lastMessage: message,
            updatedAt: new Date().toISOString()
          };
        }
        return conv;
      });
    });
  }, []);

  // Increment unread count for a conversation
  const incrementUnreadCount = useCallback((conversationId) => {
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.conversationId === conversationId) {
          return {
            ...conv,
            unreadCount: conv.unreadCount + 1
          };
        }
        return conv;
      });
    });
    
    // Also increment total unread count
    setTotalUnreadCount(prev => prev + 1);
  }, []);

  // Reset unread count for a conversation
  const resetUnreadCount = useCallback((conversationId) => {
    console.log('Resetting unread count for conversation:', conversationId);
    
    setConversations(prevConversations => {
      // Find the conversation to reset within this callback to avoid dependencies
      const conversationToReset = prevConversations.find(c => c.conversationId === conversationId);
      const unreadCountToSubtract = conversationToReset ? conversationToReset.unreadCount : 0;
      
      // Update total unread count based on what we're resetting
      if (unreadCountToSubtract > 0) {
        setTotalUnreadCount(prev => Math.max(0, prev - unreadCountToSubtract));
      }
      
      // Return updated conversations
      return prevConversations.map(conv => {
        if (conv.conversationId === conversationId) {
          return {
            ...conv,
            unreadCount: 0
          };
        }
        return conv;
      });
    });
  }, []); // No dependencies to prevent loops

  // Sort conversations by latest message
  const sortConversations = useCallback(() => {
    setConversations(prevConversations => {
      return [...prevConversations].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA; // Sort by most recent
      });
    });
  }, []);

  // Set up socket listeners for real-time updates
  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up message notification listener');
    
    // Create a stable handler function that doesn't depend on changing state
    const handleMessageNotification = ({ conversationId, message }) => {
      console.log('Received message notification:', { conversationId, message });
      
      // Update the conversation with the new message
      updateConversationWithMessage(message);
      
      // Only increment unread count if user is not in this conversation
      if (activeConversationIdRef.current !== conversationId) {
        incrementUnreadCount(conversationId);
        
        // Find the conversation within this callback to avoid dependencies
        setConversations(currentConversations => {
          const conversation = currentConversations.find(c => c.conversationId === conversationId);
          if (conversation) {
            notificationService.showMessageNotification(
              conversation.chatPartner.name,
              message.messageText,
              conversationId
            );
          }
          return currentConversations; // Return unchanged, we're just using this to access current state
        });
      }
      
      // Sort conversations to bring the updated one to the top
      sortConversations();
    };
    
    // Listen for new message notifications
    socketService.onMessageNotification(handleMessageNotification);

    // Clean up listeners when component unmounts
    return () => {
      console.log('Cleaning up message notification listener');
      socketService.removeListener('messageNotification', handleMessageNotification);
    };
  }, [user, updateConversationWithMessage, incrementUnreadCount, sortConversations]); // Removed conversations dependency

  // Initial fetch of conversations
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    totalUnreadCount,
    loading,
    error,
    fetchConversations,
    updateConversationWithMessage,
    incrementUnreadCount,
    resetUnreadCount,
    sortConversations,
    setActiveConversationId
  };
};

export default useConversations;
