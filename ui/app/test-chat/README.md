# BetaBae Test Chat App

This is a simple test chat application for testing the BetaBae backend chat functionality. It demonstrates real-time chat features using WebSockets and React Native.

## Features

1. **Real-time Chat List Updates**
   - Automatically updates the chat list when new messages arrive
   - Shows unread count and latest message without requiring page refresh
   - Updates happen even if the user is not in the specific chat room

2. **Automatic Chat Room Updates**
   - Chat rooms update in real-time when new messages arrive
   - Messages appear instantly without requiring manual refresh

3. **Sender/Receiver Message Display**
   - Messages are displayed on the correct side based on sender ID
   - Sender's messages appear on the right (blue bubbles)
   - Receiver's messages appear on the left (gray bubbles)

## Project Structure

```
/test-chat
├── components/                # Reusable UI components
│   ├── ConversationItem.js    # Single conversation in the list
│   ├── ErrorMessage.js        # Error message display
│   ├── LoadingIndicator.js    # Loading spinner
│   └── MessageBubble.js       # Chat message bubble
├── contexts/
│   └── AuthContext.js         # Authentication state management
├── hooks/
│   ├── useConversations.js    # Custom hook for managing conversations
│   └── useMessages.js         # Custom hook for managing messages
├── screens/
│   ├── ChatListScreen.js      # List of all conversations
│   ├── ChatRoomScreen.js      # Individual chat room
│   ├── LoginScreen.js         # User login
│   ├── ProfileScreen.js       # User profile
│   └── RegisterScreen.js      # User registration
├── services/
│   ├── api.js                 # API requests to backend
│   └── socket.js              # WebSocket connection management
├── utils/
│   └── dateUtils.js           # Date formatting utilities
└── index.js                   # Main app component with navigation
```

## How It Works

### Real-time Updates

The app uses Socket.IO to establish a WebSocket connection with the backend:

1. When a user logs in, a socket connection is established
2. The user automatically joins a user-specific room (`user:{userId}`)
3. When in a chat room, the user joins a conversation-specific room (`conversation:{conversationId}`)
4. New messages are broadcast to all users in the conversation room
5. Message notifications are sent to the recipient's user-specific room

### Unread Messages

Unread messages are tracked using Redis on the backend:

1. When a new message is sent, the unread count for the recipient is incremented
2. When a user enters a chat room, all messages are marked as read
3. The chat list shows the unread count for each conversation
4. The total unread count is displayed in the header

## Usage

To use this test chat app:

1. Make sure the BetaBae backend is running
2. Navigate to this app in the UI
3. Login with your credentials
4. Start chatting!

## Integration with BetaBae Backend

This test app integrates with the BetaBae backend using:

- REST API calls for authentication and data fetching
- WebSocket connections for real-time updates
- Redis for tracking unread message counts

The app demonstrates how the backend provides all necessary information for implementing the required real-time chat features.
