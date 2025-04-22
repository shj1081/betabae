import { useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../services/api';
import socketService from '../services/socket';
import { useAuth } from '../contexts/AuthContext';

const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (limit = 20, before) => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching messages for conversation ${conversationId}, limit: ${limit}, before: ${before || 'none'}`);
      
      const response = await chatAPI.getMessages(conversationId, limit, before);
      console.log('Received messages response:', response);
      
      // Extract messages from the response
      // The API returns { message: '...', data: [...messages] }
      const messagesData = response.data || [];
      console.log('Extracted messages:', messagesData);
      
      // Ensure messages have the correct structure and sender IDs are numbers
      const normalizedMessages = messagesData.map(msg => {
        // Make sure the message has a sender object with an id property
        if (!msg.sender) {
          console.error('Message missing sender:', msg);
          // If no sender, use a placeholder to prevent errors
          return {
            ...msg,
            sender: { id: -1 } // Use a placeholder ID that won't match any real user
          };
        }
        
        return {
          ...msg,
          sender: {
            ...msg.sender,
            id: Number(msg.sender.id)
          }
        };
      });
      
      // If we're loading more (pagination), append to existing messages
      if (before) {
        setMessages(prevMessages => [...prevMessages, ...normalizedMessages]);
      } else {
        // Initial load
        setMessages(normalizedMessages);
      }
      
      // Check if there are more messages to load
      setHasMore(messagesData.length === limit);
      
      // Note: The backend automatically marks messages as read when fetching them
      // No need to call a separate endpoint for marking messages as read
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages');
      // Ensure messages is at least an empty array if the API call fails
      if (!before) {
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || loading || !messages || messages.length === 0) return;
    
    const oldestMessageId = messages[messages.length - 1].messageId;
    await fetchMessages(20, oldestMessageId);
  }, [fetchMessages, hasMore, loading, messages]);

  // Send a text message
  const sendMessage = useCallback(async (messageText) => {
    if (!conversationId || !messageText.trim()) return;
    
    try {
      setError(null);
      const message = await socketService.sendMessage(conversationId, messageText);
      
      // Optimistically add the message to the UI
      // The actual message will come through the socket
      const optimisticMessage = {
        messageId: Date.now(), // Temporary ID
        conversationId,
        sender: {
          id: Number(user.id), // Ensure ID is a number
          name: user.name,
        },
        messageText,
        sentAt: new Date().toISOString(),
        isRead: false,
        readAt: null,
        // This is an optimistic message, will be replaced by the real one from socket
        isOptimistic: true, 
      };
      
      setMessages(prevMessages => [optimisticMessage, ...prevMessages]);
      
      return message;
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      throw err;
    }
  }, [conversationId, user]);

  // Join the conversation room when component mounts
  useEffect(() => {
    if (!conversationId) return;
    
    const joinConversationRoom = async () => {
      try {
        await socketService.joinRoom(conversationId);
        console.log(`Joined conversation room: ${conversationId}`);
      } catch (err) {
        console.error('Failed to join conversation room:', err);
      }
    };
    
    joinConversationRoom();
    
    // Leave the room when component unmounts
    return () => {
      socketService.leaveRoom(conversationId).catch(err => {
        console.error('Failed to leave conversation room:', err);
      });
    };
  }, [conversationId]);

  // Fetch messages initially - only run once when conversationId changes
  useEffect(() => {
    if (!conversationId) return;
    
    // Initial fetch of messages
    console.log('Initial message fetch for conversation:', conversationId);
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]); // Intentionally omitting fetchMessages from dependencies
  
  // Set up socket listeners separately from data fetching
  useEffect(() => {
    if (!conversationId) return;
    
    console.log('Setting up message listener for conversation:', conversationId);
    
    // Create a stable message handler function
    const handleNewMessage = (newMessage) => {
      console.log('Received new message:', newMessage);
      if (newMessage.conversationId === parseInt(conversationId)) {
        // Normalize the new message to ensure it has the correct structure
        let normalizedMessage;
        
        // Check if the message has the correct structure
        if (!newMessage.sender) {
          console.error('Socket message missing sender:', newMessage);
          // Try to extract sender information from the message
          const senderId = newMessage.sender_id || -1;
          
          normalizedMessage = {
            ...newMessage,
            sender: { id: Number(senderId) }
          };
        } else {
          normalizedMessage = {
            ...newMessage,
            sender: {
              ...newMessage.sender,
              id: Number(newMessage.sender.id)
            }
          };
        }
        
        console.log('Normalized message with sender ID:', normalizedMessage.sender.id);
        
        setMessages(prevMessages => {
          // Remove any optimistic version of this message if it exists
          const filteredMessages = prevMessages.filter(
            msg => !msg.isOptimistic || msg.messageText !== normalizedMessage.messageText
          );
          
          // Add the new message at the beginning
          return [normalizedMessage, ...filteredMessages];
        });
      }
    };
    
    // Set up socket listener for new messages
    socketService.onNewMessage(handleNewMessage);
    
    // Clean up listeners when component unmounts
    return () => {
      console.log('Cleaning up message listener for conversation:', conversationId);
      // Use our custom method to remove the specific listener
      socketService.removeListener('newMessage', handleNewMessage);
    };
  }, [conversationId]); // Only depend on conversationId, not fetchMessages

  return {
    messages,
    loading,
    error,
    hasMore,
    sendMessage,
    loadMoreMessages,
  };
};

export default useMessages;
