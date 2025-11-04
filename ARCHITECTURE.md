# Architecture Documentation

This document describes the system architecture of the AI Math Tutor application.

## Overview

The AI Math Tutor is a full-stack web application that provides Socratic-style math tutoring through conversational AI. The system is built with React (frontend) and Express.js (backend), deployed to Vercel as serverless functions.

## System Architecture Diagram

The complete system architecture is visualized in the Mermaid diagram:

**See: [architecture.mermaid](architecture.mermaid)**

To view the diagram:
1. Use a Mermaid-compatible viewer (VS Code extension, GitHub, or online Mermaid editor)
2. Or use: https://mermaid.live/ and paste the contents of `architecture.mermaid`

## High-Level Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Student   │─────────▶│  Frontend   │─────────▶│   Backend   │
│   (User)    │◀─────────│   (React)   │◀─────────│  (Express)  │
└─────────────┘         └─────────────┘         └─────────────┘
                                                         │
                                                         ▼
                                                 ┌─────────────┐
                                                 │   OpenAI     │
                                                 │   GPT-4      │
                                                 └─────────────┘
                                                         │
                                                         ▼
                                                 ┌─────────────┐
                                                 │  Firebase   │
                                                 │  (Firestore │
                                                 │   Storage)   │
                                                 └─────────────┘
```

## Component Breakdown

### Frontend (React + Vite)

**Location:** `frontend/src/`

**Key Components:**
- **Chat.jsx** - Main chat interface with message management
- **MessageList.jsx** - Displays conversation history
- **MessageInput.jsx** - Input field with image upload
- **MathDisplay.jsx** - Renders LaTeX equations and markdown
- **Login.jsx / SignUp.jsx** - Authentication UI
- **ProtectedRoute.jsx** - Route guard for authenticated pages

**State Management:**
- **AuthContext** - Global authentication state (user, token)
- **Local State** - Message state managed with `useState` hooks
- **Optimistic Updates** - Messages appear instantly, persist in background

**Key Features:**
- Real-time message streaming from backend
- Optimistic UI updates for instant feedback
- Non-blocking Firebase persistence
- Math rendering with KaTeX
- Markdown parsing for rich text

### Backend (Express.js)

**Location:** `api/`

**Key Routes:**
- **POST /api/chat** - Main chat endpoint with streaming
  - Handles text and image messages
  - Integrates OpenAI GPT-4 Vision
  - Streams responses via Server-Sent Events (SSE)
  - Uses Socratic prompting system

**Services:**
- **promptService.js** - Socratic system prompt generation
- **contextManager.js** - Analyzes conversation context
  - Detects student understanding level
  - Tracks stuck turns and hints
  - Provides adaptive scaffolding
- **firestoreService.js** - Firestore read operations (optional)

**Middleware:**
- **auth.js** - Firebase token verification
- **CORS** - Cross-origin resource sharing
- **Error Handling** - Global error handlers

**Key Features:**
- Server-side OpenAI API key management
- Streaming responses via AI SDK v5
- Vision API integration for image parsing
- Context-aware Socratic prompting

### External Services

#### OpenAI GPT-4

**Models Used:**
- **gpt-4o** - For messages with images (vision support)
- **gpt-4-turbo** - For text-only messages

**Integration:**
- All API calls go through Express backend
- Uses Vercel AI SDK v5 (`streamText`, `pipeTextStreamToResponse`)
- Streaming responses for real-time UX

#### Firebase

**Services Used:**
- **Authentication** - Email/password sign-in
- **Firestore** - Conversation and message persistence
- **Storage** - Image upload and retrieval

**Data Structure:**
```
/conversations/{conversationId}
  - userId: string
  - title: string (auto-generated)
  - createdAt: timestamp
  - updatedAt: timestamp
  - messageCount: number
  - lastMessage: string

/messages/{messageId}
  - conversationId: string
  - role: 'user' | 'assistant'
  - content: string
  - imageUrl?: string (if image attached)
  - timestamp: timestamp
```

## Data Flow

### 1. User Sends Message

```
User Input → MessageInput → Chat.jsx
  ↓
1. Optimistic UI Update (add to state)
2. Upload Image (if present) → Firebase Storage
3. Persist User Message → Firestore (non-blocking)
4. Send Request → POST /api/chat
```

### 2. Backend Processing

```
Express Route → Authenticate User
  ↓
Check for imageUrl → Use gpt-4o (vision) or gpt-4-turbo
  ↓
Build Messages Array:
  - System Prompt (Socratic)
  - Context Instructions (from contextManager)
  - Conversation History
  - Current Message (+ image if present)
  ↓
OpenAI API Call → streamText()
  ↓
Stream Response → pipeTextStreamToResponse()
```

### 3. Frontend Receives Stream

```
Server-Sent Events → parseAIStream()
  ↓
Chunk-by-chunk updates → Update AI message in state
  ↓
On Complete → Persist AI message to Firestore (non-blocking)
```

### 4. Message Rendering

```
MessageList → MathDisplay
  ↓
1. Extract Math Expressions ($...$, $$...$$, \(...\), \[...\])
2. Determine Inline vs Block (complexity-based)
3. Render Text Parts → Parse Markdown (**bold**, *italic*, `code`)
4. Combine: Math + Markdown + Plain Text
```

## Key Design Decisions

### 1. Manual State Management (No useChat)

**Decision:** Removed Vercel AI SDK's `useChat` hook from frontend

**Reason:**
- More control over state management
- Better integration with Firebase persistence
- Simpler debugging
- Avoids hook conflicts

**Implementation:**
- Manual `useState` for messages
- Custom `parseAIStream` utility
- Optimistic updates with background persistence

### 2. Optimistic UI + Non-Blocking Persistence

**Decision:** Messages appear instantly, persist in background

**Reason:**
- Instant user feedback
- No blocking on Firebase writes
- Graceful degradation if persistence fails

**Implementation:**
- User message added to state immediately
- Firebase save happens asynchronously (fire-and-forget)
- AI message persists after streaming completes

### 3. Single Conversation Per User

**Decision:** Each user has one ongoing conversation

**Reason:**
- Simpler MVP architecture
- Easier to manage context
- Can extend to multiple conversations later

**Implementation:**
- Get-or-create pattern on first message
- All messages stored in same conversation
- Conversation ID tracked in state

### 4. Math Processing Order

**Decision:** Math extraction → Markdown parsing

**Reason:**
- Preserve math notation from markdown parsing
- Math expressions are identified first
- Markdown only processes text parts

**Implementation:**
- Two-pass parsing: math first, then markdown
- MathDisplay component handles both

### 5. Intelligent Math Rendering

**Decision:** Automatic inline vs block detection

**Reason:**
- Better readability
- Simpler for AI (no need to specify format)
- Consistent user experience

**Implementation:**
- Complexity heuristics (operators, fractions, length)
- Explicit block markers (`$$`, `\[`) always block
- Simple variables (`$x$`) render inline

## Security Considerations

### API Key Security

- **OpenAI API Key:** Stored server-side only, never exposed to frontend
- **Firebase Keys:** Frontend config is public (by design), but protected by security rules
- **Service Account:** Backend uses Firebase Admin SDK with private key

### Authentication

- **Frontend:** Firebase Auth with email/password
- **Backend:** Verifies Firebase ID tokens on each request
- **Protected Routes:** React Router guards + backend middleware

### Data Security

- **Firestore Rules:** Users can only read/write their own conversations
- **Storage Rules:** Users can only upload/read their own images
- **CORS:** Configured for specific origins

## Performance Optimizations

### Frontend

- **Optimistic Updates:** Instant UI feedback
- **Non-Blocking Persistence:** Doesn't block user interaction
- **Efficient Math Parsing:** O(n) regex matching
- **Streaming:** Real-time response display

### Backend

- **Streaming Responses:** Reduces time-to-first-token
- **Context Analysis:** Stateless, O(n) complexity
- **Efficient Prompt Building:** Minimal string operations

## Deployment Architecture

### Vercel Deployment

```
Vercel Platform
├── Frontend (Static)
│   └── Served from frontend/dist
└── Backend (Serverless Functions)
    └── Express routes → /api/* → serverless functions
```

**Key Points:**
- Frontend and backend deployed together
- Express app auto-wrapped as serverless functions
- Environment variables configured in Vercel dashboard
- Automatic HTTPS and CDN

## Future Enhancements

### Planned Features

1. **Interactive Whiteboard**
   - Canvas-based drawing
   - Step visualization rendering
   - Collaborative state management

2. **Voice Interface**
   - Text-to-Speech for tutor responses
   - Speech-to-Text for student input
   - Browser Web Speech API

3. **Enhanced Context**
   - Multi-conversation support
   - Problem type detection
   - Progress tracking

### Architectural Improvements

1. **State Management**
   - Consider Zustand or Redux for complex state
   - Real-time listeners for collaboration

2. **Caching**
   - Cache OpenAI responses for common problems
   - Optimize Firestore queries

3. **Performance**
   - Code splitting for frontend
   - Lazy loading components
   - Image optimization

## Related Documentation

- **[SETUP.md](SETUP.md)** - Setup and configuration
- **[README.md](README.md)** - Project overview
- **[PRD.md](PRD.md)** - Product requirements
- **[tasks.md](tasks.md)** - Development roadmap

---

**Last Updated:** See commit history for latest changes.

