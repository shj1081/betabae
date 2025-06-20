# BetaBae Backend API Documentation

This document provides a detailed overview of the backend APIs for the BetaBae application.

## Table of Contents

- [Authentication](#authentication)
- [Chat](#chat)
- [WebSocket](#websocket)
- [Feed](#feed)
- [File](#file)
- [LLM Clone](#llm-clone)
- [Match](#match)
- [User](#user)

---

## Authentication

Base path: `/auth`

### 1. Register a new user

- **Endpoint:** `/register`
- **Method:** `POST`
- **Description:** Registers a new user and automatically logs them in, creating a session.
- **Request Body:** `application/json`

  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **Response Body:** `LoginResponseDto`

### 2. Log in a user

- **Endpoint:** `/login`
- **Method:** `POST`
- **Description:** Logs in an existing user by validating their credentials and creating a session.
- **Request Body:** `application/json`

  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **Response Body:** `LoginResponseDto`

  ```json
  {
    "email": "user@example.com",
    "hasProfile": true,
    "hasLoveLanguage": true,
    "hasPersonality": false
  }
  ```

### 3. Log out a user

- **Endpoint:** `/logout`
- **Method:** `POST`
- **Description:** Logs out the currently authenticated user by clearing their session cookie.
- **Request Body:** None (uses session cookie for authentication).

---

## Chat

Base path: `/chat/conversations`

### 1. Get conversations

- **Endpoint:** `/`
- **Method:** `GET`
- **Description:** Retrieves a list of conversations for the authenticated user. Can be filtered by type.
- **Query Parameters:**
  - `type` (optional): `betabae` or `realbae`. If not provided, all conversations are returned.
- **Response Body:** `ConversationListResponseDto`

  ```json
  {
    "conversations": [
      {
        "conversationId": 1,
        "matchId": 5,
        "type": "BETA_BAE",
        "chatPartner": {
          "id": 2,
          "nickname": "Jane",
          "profileImageUrl": "https://example.com/image.jpg"
        },
        "unreadCount": 3,
        "lastMessage": {
          "messageId": 42,
          "conversationId": 1,
          "sender": {
            "id": 2,
            "name": "Jane"
          },
          "messageText": "Hello there!",
          "sentAt": "2025-06-20T15:30:45.123Z",
          "isRead": false
        },
        "createdAt": "2025-06-19T10:15:30.000Z",
        "updatedAt": "2025-06-20T15:30:45.123Z"
      }
    ],
    "totalUnreadCount": 3
  }
  ```

### 2. Get messages in a conversation

- **Endpoint:** `/:cid/messages`
- **Method:** `GET`
- **Description:** Retrieves the messages for a specific conversation.
- **Path Parameters:**
  - `cid`: The ID of the conversation.
- **Query Parameters:**
  - `limit` (optional): Number of messages to retrieve.
  - `before` (optional): Cursor for pagination (message ID).
- **Response Body:** `MessageListResponseDto`

  ```json
  {
    "messages": [
      {
        "messageId": 42,
        "conversationId": 1,
        "sender": {
          "id": 2,
          "name": "Jane"
        },
        "messageText": "Hello there!",
        "sentAt": "2025-06-20T15:30:45.123Z",
        "isRead": false,
        "attachment": null
      },
      {
        "messageId": 41,
        "conversationId": 1,
        "sender": {
          "id": 1,
          "name": "John"
        },
        "messageText": "Hi Jane!",
        "sentAt": "2025-06-20T15:29:30.456Z",
        "isRead": true,
        "readAt": "2025-06-20T15:29:45.789Z"
      }
    ]
  }
  ```

### 3. Send a text message

- **Endpoint:** `/:cid/messages/text`
- **Method:** `POST`
- **Description:** Sends a text message to a conversation.
- **Path Parameters:**
  - `cid`: The ID of the conversation.
- **Request Body:** `application/json`

  ```json
  {
    "messageText": "Hello, how are you?"
  }
  ```

- **Response Body:** `{ ok: boolean; message: MessageResponseDto }`

### 4. Send an image message

- **Endpoint:** `/:cid/messages/image`
- **Method:** `POST`
- **Description:** Sends an image message to a conversation.
- **Path Parameters:**
  - `cid`: The ID of the conversation.
- **Request Body:** `multipart/form-data`

  ```
  // Form Data
  file: (binary file data)
  messageText: "Here is an image for you!" (optional)
  ```

- **Response Body:** `{ ok: boolean; message: MessageResponseDto }`

### 5. Send a file message

- **Endpoint:** `/:cid/messages/file`
- **Method:** `POST`
- **Description:** Sends a file message to a conversation.
- **Path Parameters:**
  - `cid`: The ID of the conversation.
- **Request Body:** `multipart/form-data`

  ```
  // Form Data
  file: (binary file data)
  messageText: "Check out this document." (optional)
  ```

- **Response Body:** `{ ok: boolean; message: MessageResponseDto }`

---

## WebSocket

Base path: WebSocket connection to `/chat` namespace

### Connection

- **Description:** Establishes a WebSocket connection to the chat server. The connection uses session cookies for authentication.
- **Authentication:** Session cookie (`session_id`) must be included in the request.
- **Events:**

#### 1. Client Events (sent from client to server)

##### Enter Room

- **Event:** `enter`
- **Description:** Notifies the server that the client has entered a chat room. This marks all messages in the conversation as read.
- **Payload:**

  ```json
  {
    "cid": 123 // Conversation ID
  }
  ```

##### Leave Room

- **Event:** `leave`
- **Description:** Notifies the server that the client has left a chat room. This marks all messages in the conversation as read.
- **Payload:**

  ```json
  {
    "cid": 123 // Conversation ID
  }
  ```

##### Send Text Message

- **Event:** `text`
- **Description:** Sends a text message to a conversation. If the conversation is with a BetaBae, the server will automatically generate and send a response.
- **Payload:**

  ```json
  {
    "cid": 123, // Conversation ID
    "text": "Hello, how are you?"
  }
  ```

#### 2. Server Events (sent from server to client)

##### Chat List Update

- **Event:** `chatListUpdate`
- **Description:** Sent when the user's chat list has been updated (e.g., after logging in, entering/leaving a room, or receiving a new message).
- **Payload:** `ConversationListResponseDto` (same format as the `/chat/conversations` API response)

##### New Message

- **Event:** `newMessage`
- **Description:** Sent when a new message is received in a conversation the client has joined.
- **Payload:** `MessageResponseDto` (same format as the message object in API responses)

---

## Feed

Base path: `/feed`

### 1. Get user feed

- **Endpoint:** `/`
- **Method:** `GET`
- **Description:** Retrieves a list of highly compatible users based on optional filters.
- **Query Parameters:** `FeedFilterDto` (e.g., `age_min`, `age_max`, `distance`, etc.)
- **Response Body:** `FeedUserListResponseDto`

  ```json
  {
    "users": [
      {
        "id": 2,
        "nickname": "Jane",
        "age": 28,
        "gender": "FEMALE",
        "location": "Seoul, South Korea",
        "profileImageUrl": "https://example.com/image.jpg",
        "compatibility": 85,
        "mbti": "ENFJ",
        "interests": ["hiking", "photography", "cooking"]
      }
    ]
  }
  ```

---

## File

Base path: `/file`

### 1. Upload a file

- **Endpoint:** `/`
- **Method:** `POST`
- **Description:** Uploads a file to the server.
- **Request Body:** `multipart/form-data`

  ```
  // Form Data
  file: (binary file data)
  context: "user-profile-image" // Example context
  ```

- **Response Body:** `UploadFileResponseDto`

  ```json
  {
    "id": 1,
    "url": "https://storage.example.com/files/image.jpg",
    "type": "image/jpeg",
    "context": "user-profile-image"
  }
  ```

### 2. Delete a file

- **Endpoint:** `/:id`
- **Method:** `DELETE`
- **Description:** Deletes a file by its ID.
- **Path Parameters:**
  - `id`: The ID of the file to delete.
- **Request Body:** None.

---

## LLM Clone

Base path: `/llm-clone`

### 1. Create BetaBae

- **Endpoint:** `/create`
- **Method:** `POST`
- **Description:** Creates a BetaBae clone for the authenticated user.
- **Request Body:** `application/json`

  ```json
  {
    "cloneName": "MyBetaBae",
    "cloneDescription": "A friendly and helpful assistant."
  }
  ```

### 2. Delete BetaBae

- **Endpoint:** `/delete`
- **Method:** `POST`
- **Description:** Deletes the BetaBae for the authenticated user.
- **Request Body:** None.

### 3. Update BetaBae

- **Endpoint:** `/update`
- **Method:** `POST`
- **Description:** Updates the BetaBae's information.
- **Request Body:** `application/json`

  ```json
  {
    "cloneName": "MyUpdatedBetaBae",
    "cloneDescription": "An even more helpful assistant."
  }
  ```

### 4. Get BetaBae Response

- **Endpoint:** `/response`
- **Method:** `POST`
- **Description:** Gets a response from the BetaBae.
- **Request Body:** `application/json`

  ```json
  {
    "messageText": "What is the weather like today?",
    "contextText": "We are in Seoul."
  }
  ```

### 5. Get RealBae Thought Response

- **Endpoint:** `/real-bae-thought`
- **Method:** `POST`
- **Description:** Gets a "thought" from a RealBae based on a message.
- **Request Body:** `application/json`

  ```json
  {
    "messageText": "I had a great time today!",
    "contextText": "We went to the park.",
    "matchId": 123
  }
  ```

- **Response Body:** `RealBaeThoughtResponseDto`

  ```json
  {
    "thought": "I think they had a good time at the park. They seem genuinely happy about our time together.",
    "sentiment": "POSITIVE",
    "suggestedResponses": [
      "I had a great time too! We should do it again soon.",
      "The weather was perfect for the park, wasn't it?",
      "What was your favorite part of our day?"
    ]
  }
  ```

---

## Match

Base path: `/match`

### 1. Create a match request

- **Endpoint:** `/`
- **Method:** `POST`
- **Description:** Sends a match request to another user.
- **Request Body:** `application/json`

  ```json
  {
    "requestedId": 456
  }
  ```

- **Response Body:** `MatchResponseDto`

### 2. Accept a match request

- **Endpoint:** `/:id/accept`
- **Method:** `POST`
- **Description:** Accepts a pending match request.
- **Path Parameters:**
  - `id`: The ID of the match.
- **Request Body:** None.
- **Response Body:** `MatchResponseDto`

### 3. Reject a match request

- **Endpoint:** `/:id/reject`
- **Method:** `POST`
- **Description:** Rejects a pending match request.
- **Path Parameters:**
  - `id`: The ID of the match.
- **Request Body:** None.
- **Response Body:** `MatchResponseDto`

### 4. Get received matches

- **Endpoint:** `/received`
- **Method:** `GET`
- **Description:** Retrieves all match requests sent to the current user.
- **Request Body:** None.
- **Response Body:** `MatchListResponseDto`

### 5. Get all matches

- **Endpoint:** `/`
- **Method:** `GET`
- **Description:** Retrieves all matches (sent and received) for the current user.
- **Request Body:** None.
- **Response Body:** `MatchListResponseDto`

### 6. Accept RealBae chat

- **Endpoint:** `/:id/real-bae/accept`
- **Method:** `POST`
- **Description:** Accepts a request to start a `REAL_BAE` conversation.
- **Path Parameters:**
  - `id`: The ID of the match.
- **Request Body:** None.
- **Response Body:** `MatchResponseDto`

### 7. Reject RealBae chat

- **Endpoint:** `/:id/real-bae/reject`
- **Method:** `POST`
- **Description:** Rejects a request to start a `REAL_BAE` conversation.
- **Path Parameters:**
  - `id`: The ID of the match.
- **Request Body:** None.
- **Response Body:** `MatchResponseDto`

---

## User

Base path: `/user`

### 1. Get user profile

- **Endpoint:** `/profile`
- **Method:** `GET`
- **Description:** Retrieves the profile of the authenticated user.
- **Request Body:** None.
- **Response Body:** `UserProfileResponseDto`

### 2. Update or create user profile

- **Endpoint:** `/profile`
- **Method:** `PUT`
- **Description:** Updates or creates the user's profile information.
- **Request Body:** `multipart/form-data`

  ```
  // Form Data
  profileImage: (binary file data) (optional)
  nickname: "MyNewNickname"
  birth: "1995-05-20T00:00:00.000Z"
  gender: "MALE"
  height: 180
  job: "Software Engineer"
  address: "Seoul, South Korea"
  religion: "NONE"
  isSmoke: false
  drinkFrequency: "SOMETIMES"
  mbti: "INFP"
  character: "calm"
  hobby: "reading, coding"
  interests: "AI, technology"
  idealType: "someone kind and smart"
  introduce: "Hello, I am a developer living in Seoul."
  ```

- **Response Body:** `UserProfileResponseDto`

### 3. Get user personality

- **Endpoint:** `/personality`
- **Method:** `GET`
- **Description:** Retrieves the personality information of the authenticated user.
- **Request Body:** None.
- **Response Body:** `UserPersonalityResponseDto`

### 4. Update or create user personality

- **Endpoint:** `/personality`
- **Method:** `PUT`
- **Description:** Updates or creates the user's personality information.
- **Request Body:** `application/json`

  ```json
  {
    "mbti": "ENFJ",
    "character": "outgoing, sociable"
  }
  ```

- **Response Body:** `UserPersonalityResponseDto`

### 5. Update user credentials

- **Endpoint:** `/credential`
- **Method:** `PUT`
- **Description:** Updates the user's password.
- **Request Body:** `application/json`

  ```json
  {
    "currentPassword": "password123",
    "newPassword": "newSecurePassword456"
  }
  ```

- **Response Body:** `BasicResponseDto`

  ```json
  {
    "message": "User credential updated successfully"
  }
  ```

### 6. Get user love language

- **Endpoint:** `/lovelanguage`
- **Method:** `GET`
- **Description:** Retrieves the love language information of the authenticated user.
- **Request Body:** None.
- **Response Body:** `UserLoveLanguageResponseDto`

### 7. Update or create user love language

- **Endpoint:** `/lovelanguage`
- **Method:** `PUT`
- **Description:** Updates or creates the user's love language information.
- **Request Body:** `application/json`

  ```json
  {
    "first": "WORDS_OF_AFFIRMATION",
    "second": "QUALITY_TIME"
  }
  ```

- **Response Body:** `UserLoveLanguageResponseDto`

### 8. Score personality survey

- **Endpoint:** `/personality/score`
- **Method:** `POST`
- **Description:** Calculates and saves the user's personality based on survey answers.
- **Request Body:** `application/json`

  ```json
  {
    "answers": [1, 4, 2, 5, 3, 1, 4, 2, 5, 3, 1, 4]
  }
  ```

- **Response Body:** `UserPersonalityResponseDto`

### 9. Score love language survey

- **Endpoint:** `/lovelanguage/score`
- **Method:** `POST`
- **Description:** Calculates and saves the user's love language based on survey answers.
- **Request Body:** `application/json`

  ```json
  {
    "answers": ["A", "B", "A", "C", "D", "A", "B", "C", "D", "A"]
  }
  ```

- **Response Body:** `UserLoveLanguageResponseDto`

### 10. Get comprehensive user info

- **Endpoint:** `/info/:id`
- **Method:** `GET`
- **Description:** Retrieves comprehensive information (profile, personality, love language) for a specific user.
- **Path Parameters:**
  - `id`: The ID of the user.
- **Request Body:** None.
- **Response Body:** Combined user information object.

  ```json
  {
    "profile": {
      "id": 2,
      "user_id": 5,
      "nickname": "Jane",
      "introduce": "Hello, I'm a designer who loves nature.",
      "birthday": "1997-08-15T00:00:00.000Z",
      "gender": "FEMALE",
      "mbti": "ENFJ",
      "interests": "art, nature, design",
      "province": "Seoul",
      "city": "Gangnam",
      "profile_media_id": 10,
      "created_at": "2025-05-10T08:30:00.000Z",
      "updated_at": "2025-06-15T14:25:30.000Z"
    },
    "personality": {
      "id": 2,
      "user_id": 5,
      "openness": 0.9,
      "conscientiousness": 0.6,
      "extraversion": 0.8,
      "agreeableness": 0.7,
      "neuroticism": 0.2,
      "created_at": "2025-05-10T08:35:00.000Z",
      "updated_at": "2025-05-10T08:35:00.000Z"
    },
    "loveLanguage": {
      "id": 2,
      "user_id": 5,
      "words_of_affirmation": 0.4,
      "acts_of_service": 0.1,
      "receiving_gifts": 0.1,
      "quality_time": 0.3,
      "physical_touch": 0.1,
      "created_at": "2025-05-10T08:40:00.000Z",
      "updated_at": "2025-05-10T08:40:00.000Z"
    }
  }
  ```
