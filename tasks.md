# AI Math Tutor - MVP PR Breakdown

**Timeline:** 3-5 days  
**Date:** November 3, 2025

---

## Priority 0 (P0) - Core Foundation PRs

These PRs must be completed first. They form the essential foundation of the application.

---

### PR #1: Project Setup & Basic Infrastructure
**Priority:** P0  
**Day:** 1

**Tasks:**
1. [x] Initialize React + Vite project (install: `vite`, `react`, `react-dom`, `@vitejs/plugin-react`)
2. [x] Set up project structure (components/, hooks/, utils/)
3. [x] Initialize Express backend (install: `express`)
4. [x] Set up environment variables (.env files) (install: `dotenv` for backend)
5. [x] Configure Firebase project and Firestore database (install: `firebase` for frontend, `firebase-admin` for backend)
6. [x] Set up Vercel AI SDK dependencies (install: `ai` package for both frontend and backend, `openai` for backend)
7. [x] Configure basic CORS and API routes (install: `cors` for backend)
8. [x] Create `vercel.json` for Express deployment to Vercel
9. [x] Create basic README with setup instructions
10. [x] Test that frontend and backend can communicate

**Acceptance Criteria:**
- Frontend runs on localhost:5173 (Vite default)
- Backend runs on localhost:3000 (Express dev server)
- Frontend can make API call to backend
- Firebase connection established
- All environment variables documented
- `vercel.json` configured for Express deployment

**Files Created:**
```
frontend/
  ├── src/
  │   ├── App.jsx
  │   ├── main.jsx
  │   ├── components/
  │   ├── hooks/
  │   └── utils/
  ├── index.html
  ├── package.json
  └── vite.config.js

api/
  ├── server.js
  ├── index.js
  ├── routes/
  ├── services/
  └── package.json

vercel.json
README.md
```

---

### PR #2: Firebase Authentication & Configuration
**Priority:** P0  
**Day:** 1

**Tasks:**
1. [x] Set up Firebase configuration files (frontend and backend)
2. [x] Initialize Firebase Auth in frontend (with named exports: firebaseAuth, firebaseFireStore, firebaseStorage)
3. [x] Initialize Firebase Admin SDK in backend
4. [x] Add Firebase auth helper functions to firebase.js (signIn, signUp, signOut, onAuthStateChange)
5. [x] Create AuthContext with AuthProvider (manages currentUser, loading state)
6. [x] Create useAuth hook (easy access to AuthContext)
7. [x] Wrap App with AuthProvider in main.jsx
8. [x] **Set up Firebase Project** (completed manually - see Firebase Setup Steps below)
9. [x] Set up routing with react-router-dom
10. [x] Create Login component with email/password (uses useAuth hook + firebase.js functions)
11. [x] Create Sign Up component (uses useAuth hook + firebase.js functions)
12. [x] Add protected route wrapper component (uses useAuth hook)
13. [x] Add authentication middleware to Express backend
14. [x] Update Chat component to send auth token
15. [x] Create authentication testing guide (TEST_AUTH.md)
16. [x] **Manual Testing Required:** Test login/signup/logout flow (see TEST_AUTH.md)
17. [x] **Manual Testing Required:** Verify backend can verify Firebase tokens

**Firebase Setup Steps (Do this now):**
1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" or "Create a project"
   - Enter project name (e.g., "math-tutoring-app")
   - Disable Google Analytics (optional for MVP)
   - Click "Create project"

2. **Enable Authentication:**
   - In Firebase Console, go to "Build" > "Authentication"
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password" provider
   - Click "Save"

3. **Enable Firestore Database:**
   - Go to "Build" > "Firestore Database"
   - Click "Create database"
   - Select "Start in test mode" (we'll add security rules later)
   - Choose a location (pick closest to users)
   - Click "Enable"

4. **Enable Firebase Storage:**
   - Go to "Build" > "Storage"
   - Click "Get started"
   - Start in test mode (we'll add security rules later)
   - Use same location as Firestore
   - Click "Done"

5. **Get Frontend Configuration:**
   - Go to Project Settings (gear icon) > "General" tab
   - Scroll to "Your apps" section
   - Click Web icon (`</>`) to add a web app
   - Register app (nickname: "math-tutor-frontend")
   - Copy the `firebaseConfig` object
   - Add to `frontend/.env` as `VITE_FIREBASE_*` variables

6. **Create Service Account (Backend):**
   - Go to Project Settings > "Service accounts" tab
   - Click "Generate new private key"
   - Download JSON file
   - Extract values:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `private_key` → `FIREBASE_PRIVATE_KEY` (keep quotes, preserve `\n`)
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - Add to `api/.env`

**Acceptance Criteria:**
- Firebase project created and configured
- Authentication enabled (Email/Password)
- Firestore Database enabled with security rules
- Firebase Storage enabled with security rules (for image uploads)
- Frontend Firebase config initialized (Auth, Firestore, Storage)
- Backend Firebase Admin SDK initialized
- Users can sign up with email/password
- Users can log in with email/password
- Users can log out
- Protected routes require authentication
- Backend can verify Firebase auth tokens
- User information available in frontend context
- Authentication state persists across page refreshes

**Files Created/Modified:**
```
frontend/src/utils/firebase.js (Auth, Firestore, Storage + helper functions)
  - Exports: firebaseAuth, firebaseFireStore, firebaseStorage
  - Helper functions: signInUser, signUpUser, signOutUser, onAuthStateChange

frontend/src/contexts/AuthContext.jsx
  - Creates AuthContext
  - Exports AuthProvider component (wraps app, provides auth state)
  - Manages currentUser, authToken, loading state via onAuthStateChange
  - Automatically refreshes auth token when user state changes

frontend/src/hooks/useAuth.js
  - Custom hook for easy access to AuthContext
  - Returns { currentUser, authToken, loading } from context

frontend/src/main.jsx (wrap <App /> with <AuthProvider>)
frontend/src/components/Login.jsx (uses useAuth() + signInUser from firebase.js)
frontend/src/components/SignUp.jsx (uses useAuth() + signUpUser from firebase.js)
frontend/src/components/ProtectedRoute.jsx (uses useAuth() to check auth)

api/utils/firebaseAdmin.js (Admin SDK with Firestore)
api/middleware/auth.js
api/server.js (add auth middleware)
```

**Implementation Pattern:**
- All Firebase SDK functions centralized in `firebase.js`
- `AuthContext` manages auth state (currentUser, authToken, loading) via `onAuthStateChange`
- `AuthProvider` wraps entire app in `main.jsx`
- `useAuth()` hook provides easy access to auth state: `{ currentUser, authToken, loading }`
- Components call firebase.js functions (signInUser, signUpUser) directly
- Auth token automatically fetched and refreshed in AuthContext
- No need to manually get token in individual components

**Why Firebase Storage?**
- Needed to persist uploaded images for conversation history
- Images are parsed by OpenAI Vision API, then stored with URLs
- Allows re-displaying images in chat history
- Storage URLs stored in Firestore conversation documents

---

### PR #3: Basic Chat UI with Vercel AI SDK
**Priority:** P0  
**Day:** 1

**Tasks:**
1. [x] Install Vercel AI SDK (`ai` package) - frontend uses `useChat` hook for UI state/streaming (calls our backend), backend uses for OpenAI integration
2. [x] Create Chat component with message history display
3. [x] Implement text input field
4. [x] Integrate `useChat()` hook from Vercel AI SDK (points to `/api/chat` endpoint, NOT OpenAI directly)
   - **VERIFIED CORRECT IMPORT:** `import { useChat } from '@ai-sdk/react'`
   - This is the correct import for `ai` package v5+ (NOT `'ai/react'`)
   - The `ai` package exports `@ai-sdk/react` with React hooks
   - Added fallback: `const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'`
5. [x] Create `/api/chat` endpoint in Express that handles OpenAI communication
   - Uses `import { streamText } from 'ai'` and `import { createOpenAI } from '@ai-sdk/openai'`
   - Backend package requires both `ai` and `@ai-sdk/openai` packages
   - Endpoint created at `/api/chat` with authentication middleware
   - CORS configured with fallback to `http://localhost:5173`
6. [x] Backend connects to OpenAI GPT-4 via Vercel AI SDK (API key stays server-side only)
   - OpenAI initialized with `createOpenAI({ apiKey: process.env.OPENAI_API_KEY })`
   - Using `gpt-4-turbo` model
   - Streaming configured via `streamText()` and `toDataStreamResponse()`
7. [x] Display user and assistant messages in chat
   - MessageList component displays all messages
   - Messages differentiated by role (user vs assistant)
   - Error messages display in red box

**Important:** All OpenAI API calls MUST go through Express backend. Frontend `useChat` hook calls our `/api/chat` endpoint, never OpenAI directly.

**Import Verification Note:**
- Frontend: `import { useChat } from '@ai-sdk/react'` ✓ CORRECT (researched and verified)
- Backend: `import { streamText } from 'ai'` ✓ CORRECT
- Backend: `import { createOpenAI } from '@ai-sdk/openai'` ✓ CORRECT (requires `@ai-sdk/openai` package)

**Acceptance Criteria:**
- ✅ Chat UI renders messages correctly
- ✅ User can type and send messages
- ✅ AI responds to messages (TESTED & WORKING)
- ✅ Conversation history displays properly
- ✅ Messages stream in real-time (Vercel AI SDK streaming)
- ✅ Authentication works end-to-end
- ✅ Error handling prevents server crashes
- ✅ OpenAI GPT-4 Turbo integration working

**Status:** ✅ **FULLY COMPLETE & TESTED** - Chat working end-to-end with OpenAI streaming

**Technical Issues Resolved:**
1. **Firebase Admin SDK Property Names:**
   - Fixed: Changed from camelCase (`projectId`, `privateKey`, `clientEmail`) to snake_case (`project_id`, `private_key`, `client_email`)
   - Firebase Admin SDK requires snake_case property names in service account object

2. **Environment Variable Loading with ES Modules:**
   - Problem: `dotenv.config()` wasn't executing before Firebase imports in ES modules
   - Solution: Converted entire backend from ES modules to CommonJS
   - Changed all `import`/`export` to `require`/`module.exports`
   - Removed `"type": "module"` from `package.json`
   - Now `require('dotenv').config()` runs synchronously before any other imports

3. **.env File Naming:**
   - Clarified that file must be named `.env` (not `.env.local`) for default `dotenv.config()`
   - Alternative: Use `--env-file=.env.local` flag with Node.js 20.6+ native support

4. **.env Quoting Rules:**
   - `FIREBASE_PROJECT_ID` - NO quotes
   - `FIREBASE_PRIVATE_KEY` - YES quotes (preserves `\n` characters)
   - `FIREBASE_CLIENT_EMAIL` - NO quotes
   - `OPENAI_API_KEY` - NO quotes

5. **Firebase Admin SDK Exports:**
   - Fixed: Export `auth` and `db` as named exports in object format
   - Changed from: `module.exports = admin; module.exports.auth = ...` (overwrites)
   - Changed to: `module.exports = { admin, auth, db }` (proper object export)
   - Allows middleware to properly destructure: `const { auth } = require('./firebaseAdmin')`

6. **AI SDK Version Compatibility:**
   - Problem: AI SDK v5 has limited model support and incompatible API
   - Solution: Downgraded to AI SDK v3 for broader model compatibility
   - Backend: `ai@3.4.33`, `@ai-sdk/openai@0.0.66`, `openai@4.67.3`
   - Frontend: `ai@3.4.33` (removed `@ai-sdk/react` - not needed in v3)
   - Changed frontend import: `import { useChat } from 'ai/react'` (v3 path)
   - Changed backend method: `result.pipeDataStreamToResponse(res)` (v3 API)
   - Now supports `gpt-4-turbo` and other OpenAI models

7. **Comprehensive Error Handling:**
   - Added try-catch blocks to all route handlers
   - Added global error handler middleware
   - Added 404 handler for unknown routes
   - Added process-level error handlers (uncaughtException, unhandledRejection)
   - Added specific OpenAI error handling (API key, rate limits, quota)
   - Production-safe error messages (hides sensitive details)

**Files Created/Modified:**
```
frontend/src/components/Chat.jsx (uses ai/react with useChat hook)
frontend/src/components/MessageList.jsx
frontend/src/components/MessageInput.jsx
frontend/package.json (ai@3.4.33, removed @ai-sdk/react)

api/routes/chat.js (POST /api/chat with streaming, error handling)
api/server.js (CommonJS, error handlers, CORS, global middleware)
api/index.js (CommonJS for Vercel)
api/utils/firebaseAdmin.js (fixed exports, property names, CommonJS)
api/middleware/auth.js (CommonJS)
api/package.json (ai@3.4.33, @ai-sdk/openai@0.0.66, openai@4.67.3)

.cursor/rules/vercel-ai-sdk-imports.mdc (import documentation)
```

**Final Package Versions:**
- Backend: `ai@3.4.33`, `@ai-sdk/openai@0.0.66`, `openai@4.67.3`
- Frontend: `ai@3.4.33`
- Model: `gpt-4-turbo` via `openai('gpt-4-turbo')`

**Architecture:**
- Frontend `useChat()` hook from `ai` package handles UI state & streaming (configured with `api: '/api/chat'` to call our backend)
- Frontend `ai` package does NOT call OpenAI directly - only manages chat UI and streams from our backend
- Express `/api/chat` route uses Vercel AI SDK server-side to call OpenAI
- OpenAI API key stays in backend environment variables, never exposed to frontend

**Why `ai` package in frontend?**
- Provides `useChat` hook for managing chat UI state (messages, loading, errors)
- Handles streaming responses from our backend endpoint
- Provides utilities for chat UI, but all AI calls go through our Express backend

---

### PR #4: Socratic Prompting System ✅ COMPLETE
**Priority:** P0  
**Day:** 1  
**Status:** Fully implemented and tested

**Tasks:**
1. [x] Create Socratic system prompt (follow PRD template)
   - Created `api/services/promptService.js` with complete Socratic prompt
   - Includes all core rules, teaching approach, question types, hint structure
   - Based on PRD Appendix C specifications
2. [x] Implement prompt in `/api/chat` endpoint
   - Integrated `buildMessagesWithSystemPrompt()` function in chat route
   - System prompt now prepended to all conversations
   - AI will follow Socratic method for all responses
3. [x] Add conversation context management
   - Created `api/services/contextManager.js` with stateless context analysis
   - Analyzes messages array to derive context without database persistence
   - Tracks: problemText, currentStep, studentUnderstanding, stuckTurns, hintsGiven
   - Detects stuck indicators: "I don't know", short responses, confusion keywords
   - Detects hint patterns in tutor responses
   - Provides adaptive scaffolding instructions based on student state
   - `buildContextInstructions()` generates dynamic guidance for AI
   - Integrated with `promptService.js` to enhance system prompt with context
   - Added context logging in `/api/chat` route for debugging
   - Ready to migrate to stateful when Firestore is added (PR #5)
4. [x] Test with hardcoded math problem: "2x + 5 = 13"
   - Tested in live chat interface
   - AI successfully guides through problem without giving direct answers
   - Socratic method working as expected
5. [x] Verify AI never gives direct answers
   - Confirmed through testing: AI asks guiding questions
   - Uses encouraging language: "Exactly!", "Great thinking!"
   - Breaks problem into discovery steps
   - System prompt enforces core rules
6. [x] Test hint triggering after 2+ stuck turns
   - Context manager successfully detects stuck turns
   - Adaptive scaffolding triggers at appropriate thresholds
   - Hint instructions added to system prompt dynamically
   - Backend logs show context tracking working correctly
7. [x] Document prompt engineering notes
   - Created comprehensive `CONTEXT_MANAGER.md` documentation
   - Documents context shape, detection algorithms, adaptive scaffolding rules
   - Includes examples, testing guide, and migration path to stateful
   - All functions fully documented with JSDoc comments

**Acceptance Criteria:** ✅ All Met
- ✅ AI guides through questions, never gives direct answers
- ✅ Hints trigger appropriately when student is stuck
- ✅ Encouraging language is used consistently
- ✅ Test conversation completes successfully with hardcoded problem
- ✅ Prompt engineering notes documented

**Files Created/Modified:**
```
api/services/promptService.js        (Enhanced with context integration)
api/services/contextManager.js       (NEW - 256 lines, fully documented)
api/services/CONTEXT_MANAGER.md      (NEW - Comprehensive documentation)
api/routes/chat.js                   (Added context logging)
```

**Implementation Summary:**
- Complete Socratic teaching system with adaptive scaffolding
- Stateless context manager tracks student progress in real-time
- Detects confusion, counts stuck turns, triggers hints at appropriate thresholds
- Backend logs context on every request for monitoring and debugging
- System adapts teaching approach based on student understanding level
- Ready for Firestore stateful migration in PR #5

**Testing Verified:**
- LaTeX formatting issues resolved (no escaped backslashes)
- Socratic method working correctly (guides without direct answers)
- Context detection accurate (stuck turns, hints, understanding level)
- Adaptive scaffolding triggers appropriately
- Backend logs show full context tracking

---

### PR #5: Firestore Integration for Conversation Persistence ✅ COMPLETE
**Priority:** P0  
**Day:** 2  
**Status:** Fully implemented and ready for testing

**Tasks:**
1. [x] Set up Firestore collections (conversations, messages)
   - Defined collection structure: `/conversations/{conversationId}` and `/conversations/{conversationId}/messages/{messageId}`
   - Conversations collection stores: userId, title, createdAt, updatedAt, messageCount, lastMessage
   - Messages subcollection stores: conversationId, role, content, timestamp, metadata
   - Collection constants exported via `COLLECTIONS` object
2. [x] Create data models for Conversation and Message
   - **Conversation Model**: id, userId, title (auto-generated from first message), createdAt, updatedAt, messageCount, lastMessage
   - **Message Model**: id, conversationId, role ('user'|'assistant'|'system'), content, timestamp, metadata (optional)
   - Metadata structure supports: imageUrls[], context object for future features
   - Created `api/services/firestoreService.js` with full CRUD operations
   - Includes: createConversation, getConversation, getUserConversations, updateConversation, deleteConversation
   - Message operations: addMessage, getMessages, getRecentMessages
   - All functions include error handling and JSDoc documentation
3. [x] Implement conversation creation endpoint
   - Created `api/routes/conversation.js` with full REST API
   - **POST /api/conversations** - Create new conversation (with optional firstMessage)
   - **GET /api/conversations** - List all user's conversations (sorted by updatedAt desc)
   - **GET /api/conversations/:id** - Get specific conversation
   - **PATCH /api/conversations/:id** - Update conversation (title, etc.)
   - **DELETE /api/conversations/:id** - Delete conversation and all messages
   - **GET /api/conversations/:id/messages** - Get all messages for conversation
   - **POST /api/conversations/:id/messages** - Add message to conversation
   - All endpoints protected with authentication middleware
   - Ownership verification on all operations
   - Comprehensive error handling (401, 403, 404, 500)
   - Registered routes in `server.js`
4. [x] Implement message persistence on each chat turn
   - Created `api/services/conversationManager.js` for single-conversation-per-user logic
   - Implements get-or-create pattern: `getOrCreateUserConversation(userId, firstMessage)`
   - Each user has ONE conversation (auto-created on first message)
   - **Persistence Model**: Messages persist via frontend state + history reload
   - useChat hook maintains messages in local state during session
   - On page refresh: loads all messages from Firestore via `/api/chat/history`
   - Backend has `persistChatTurn()` available for future use if needed
   - Simple, reliable persistence without streaming complexity
5. [x] Add conversation history retrieval
   - Created `GET /api/chat/history` endpoint
   - Returns messages in format compatible with `useChat` hook
   - Query param: `?limit=100` (optional)
   - Loads messages from user's single conversation
   - Returns empty array if no conversation exists yet
   - Function: `loadConversationHistory(userId, limit)`
6. [x] Load conversation history on mount and initialize useChat
   - **Design Decision: Simple fetch-on-mount vs real-time listeners**
   - Real-time listeners would cause race conditions (stream→persist→listener = duplicates)
   - useChat already provides real-time updates during active session (local state)
   - Firestore is write-only during session, read-only on mount
   - One source of truth: useChat local state during session, Firestore for persistence
   - Simpler, faster, no state reconciliation needed
   - Modified `Chat.jsx` to fetch history via `GET /api/chat/history` on mount
   - Uses `setMessages()` to initialize useChat with loaded history
   - Added loading spinner while fetching history
   - Graceful error handling: shows warning but allows fresh conversation
   - Console logs number of messages loaded for debugging
7. [x] Test conversation persistence across page refreshes
   - Implementation complete and ready for testing
   - Flow: User sends message → streams response → persists to Firestore → on refresh loads from DB
   - Single conversation per user pattern working as designed

**Acceptance Criteria:** ✅ All Met
- ✅ New conversations create Firestore documents (auto-created on first message)
- ✅ Messages persist to Firestore after streaming completes
- ✅ Conversation history loads on page refresh via `GET /api/chat/history`
- ✅ Real-time updates work during session (via useChat local state)
- ✅ Single conversation per user (get-or-create pattern)

**Files Created/Modified:**
```
api/services/firestoreService.js       (Read-only CRUD operations)
api/routes/chat.js                     (GET /api/chat/history - returns conversationId + messages)
frontend/src/services/chatService.js   (NEW - Firestore write functions)
frontend/src/components/Chat.jsx       (Optimistic UI with background saves)
firestore.rules                        (NEW - Security rules for client writes)
```

**Files Removed (Simplified):**
```
api/services/conversationManager.js    (DELETED - write logic moved to frontend)
api/routes/conversation.js             (DELETED - REST API not needed)
```

**Architecture Summary:**
- **Single Conversation Per User**: Simplified MVP approach
- **Frontend Direct Writes**: All persistence happens from frontend to Firestore
- **Backend Read-Only**: Backend only loads history, no write operations
- **Optimistic UI Updates**: Messages appear instantly, Firestore saves in background
- **Non-Blocking Persistence**: Saves don't block UI, failures are silent
- **No Real-Time Listeners**: Avoided race conditions and state complexity
- **One Source of Truth**: useChat local state during session, Firestore for persistence
- **Flow**: User message → instant UI → background save → AI streams → save after complete

**Testing Verified:**
1. ✅ Send message → appears instantly in UI (optimistic)
2. ✅ AI response → streams immediately, no lag
3. ✅ Messages persist to Firestore in background
4. ✅ Refresh page → loads all messages from history
5. ✅ Single conversation per user maintained
6. ✅ Firestore console shows conversations + messages

---

### PR #6: Image Upload UI with Firebase Storage
**Priority:** P0  
**Day:** 2

**Scope:** Single image upload for MVP (not multiple)

**Tasks:**
1. [x] Set up Firebase Storage in frontend utils
2. [x] Create image upload button in MessageInput component
3. [x] Implement file input with accept="image/*" (single file only)
4. [x] Add image preview before upload
5. [x] Upload image to Firebase Storage and get download URL
6. [x] Display uploaded images in chat messages
7. [x] Handle file size/type validation (max 10MB, image types only)

**Acceptance Criteria:** ✅ All Met
- ✅ User can click upload button (📷) and select ONE image
- ✅ Image preview displays before sending message (with remove button)
- ✅ Image uploads to Firebase Storage during message send
- ✅ Loading spinner shows during upload ("Uploading..." button state)
- ✅ Uploaded image displays in conversation with message
- ✅ Download URL stored in message `imageUrl` field
- ✅ Error handling for file size/type issues (validation + alerts)
- ✅ Security rules documented in firestore.rules (not applied yet - testing mode)

**Files Created/Modified:**
```
frontend/src/utils/firebase.js           (Already had Storage - exported firebaseStorage)
frontend/src/services/storageService.js  (NEW - uploadImage, validateImageFile, formatFileSize)
frontend/src/components/MessageInput.jsx (Added 📷 button, preview, file input)
frontend/src/components/MessageList.jsx  (Display images in messages, click to open)
frontend/src/components/Chat.jsx         (Image state, upload logic, optimistic UI)
frontend/src/services/chatService.js     (saveMessage handles imageUrl field)
firestore.rules                          (Documented both Firestore + Storage security rules)
```

**Technical Implementation:**
- **Single Image Upload**: 📷 button triggers file input (accept="image/*")
- **Validation**: Client-side checks for type and 10MB size limit
- **Preview**: Shows 60x60 thumbnail with remove button
- **Upload Flow**: Image → Firebase Storage → get URL → send message with imageUrl
- **Display**: Images show in chat with max 300px height, click to open full size
- **Storage Path**: `chat-images/{userId}/{timestamp}_{filename}`
- **Optimistic UI**: Upload happens before message send (blocking for this flow)
- **Error Handling**: Validation errors show alerts, upload errors prevent message send

**Security & CORS Setup:**

**Firestore Rules (Documented, Not Applied):**
- Helper functions for auth, conversation ownership checks
- Users can only read/write their own conversations
- Documented in `firestore.rules`

**Storage Rules & CORS (Required for Testing):**
1. **Apply Storage Rules** (Firebase Console → Storage → Rules):
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;  // Testing: any authenticated user
       }
     }
   }
   ```

2. **Configure CORS** (fix localhost CORS errors):
   ```bash
   # Install Google Cloud SDK if not installed
   # Then run:
   gsutil cors set cors.json gs://YOUR-PROJECT-ID.appspot.com
   ```
   
   Or use Firebase Console → Storage → allow localhost origins

**CORS Configuration File:**
- Created `cors.json` with localhost origins (5173, 3000)
- Apply using gsutil command above

---

### PR #7: OpenAI Vision Integration for Image Parsing
**Priority:** P0  
**Day:** 2

**Scope:** Automatic problem extraction when images are sent - no separate confirmation step

**Tasks:**

**Refactor: Remove `useChat` Hook (Simplification)**
1. [x] Remove `ai` package from frontend dependencies
2. [x] Create `parseAIStream` utility in `frontend/src/services/api.js` for parsing SSE streams
3. [x] Replace `useChat` with manual state management in `Chat.jsx`:
   - [x] Replace `messages` from `useChat` with `useState`
   - [x] Replace `input` from `useChat` with `useState`
   - [x] Replace `isLoading` from `useChat` with `useState`
   - [x] Replace `handleSubmit` with custom submit handler
   - [x] Remove `handleInputChange`, use direct `setInput`
   - [x] Add `conversationId` state (replaced ref-based tracking)
4. [x] Implement manual streaming with `fetch` + `parseAIStream`
5. [x] Test chat functionality (send message, receive streaming response, persistence)
6. [x] Update `.cursor/rules/vercel-ai-sdk-imports.mdc` to reflect removal
7. [x] Update memory bank to document the refactor

**State Management Flow (Post-Refactor):**

**On Mount:**
- Fetch conversation history once via `loadConversationHistory(authToken)`
- Set `conversationId` and `messages` state
- No real-time listeners, single fetch only

**User Sends Message (Optimistic UI):**
1. Upload image to Firebase Storage if present (blocking)
2. Create user message object with `imageUrl` if applicable
3. Add user message to local state immediately (optimistic)
4. Clear input and set loading state
5. Fire non-blocking Firebase persistence: `persistUserMessage(content, imageUrl)`
6. Create AI message placeholder and add to state
7. Make fetch request to `/api/chat` with message history
8. Stream AI response chunks and update AI message in real-time
9. On stream complete: persist AI message to Firebase (non-blocking)

**Firebase Persistence (Fire-and-Forget):**
- All Firebase writes are non-blocking (async, no await in main flow)
- Errors logged but don't block UI
- User messages persist immediately after appearing in UI
- AI messages persist after streaming completes
- `conversationId` created on first message if needed

**Key Principles:**
- Local state is source of truth during session
- Optimistic updates for instant UX
- Firebase persistence happens in background
- No real-time sync (prevents race conditions with streaming)
- On refresh: load from Firebase, continue session

**Vision Integration**
8. [x] Modify POST `/api/chat` to accept `imageUrl` in message body
9. [x] Integrate OpenAI Vision API (gpt-4o) in chat route
10. [x] When imageUrl present, include image in OpenAI request with vision model
11. [x] Update Socratic prompt to acknowledge and work with extracted problem
12. [x] Test with printed math problem screenshots
13. [x] Handle Vision API errors gracefully (fallback to text-only response)

**Acceptance Criteria:**
- User sends image → AI automatically sees and parses it
- Vision model extracts problem text from images (>90% for printed)
- AI acknowledges the problem: "I see you've uploaded [problem]. Let's work through it!"
- AI starts tutoring immediately (no separate confirmation needed)
- Text + image can be sent together
- Error messages if Vision API fails
- Works with PNG, JPG formats

**Technical Approach:**
- Leverage existing image upload from PR #6 (imageUrl already saved)
- Modify `/api/chat` to check for `imageUrl` in request
- Use `gpt-4o` model when image present (native vision support, replaces deprecated `gpt-4-vision-preview`)
- Use `gpt-4-turbo` for text-only messages
- Pass image URL directly to OpenAI via multi-part content format (no re-upload needed)
- Vision and Socratic prompting work together seamlessly
- Fixed context manager to handle multi-part content (array format for images)

**Files Modified:**
```
api/routes/chat.js           (Add vision model support, check for imageUrl, upgraded to AI SDK v5)
api/services/promptService.js (Update system prompt for image awareness)
api/services/contextManager.js (Fixed extractTextContent to handle multi-part content arrays)
frontend/src/components/Chat.jsx (Send imageUrl in chat request body, removed useChat, manual state management)
frontend/src/services/api.js (parseAIStream utility for plain text streaming)
```

**Additional Changes:**
- Upgraded AI SDK from v3.4.33 to v5.0.76 (backend only)
- Changed from `pipeDataStreamToResponse` to `pipeTextStreamToResponse` (v5 API)
- Removed `ai` package from frontend dependencies
- Fixed context manager to extract text from multi-part content (handles image messages)
- All debug logs commented out (can be uncommented for troubleshooting)

---

### PR #8: Math Rendering with KaTeX
**Priority:** P0  
**Day:** 2-3

**Tasks:**
1. [x] Install KaTeX library (`katex` and `react-katex` packages)
2. [x] Create MathDisplay component
3. [x] Parse LaTeX notation from AI responses (integrated MathDisplay into MessageList)
4. [x] Render inline math equations (simple variables like `$x$` render inline)
5. [x] Render block math equations (complex equations render on own line, centered)
6. [x] Style equations for readability (centered, spaced, clear separation)
7. [x] Test with various equation types (see sample problems below)
8. [x] Update system prompt to instruct AI to use `$...$` format for equations
9. [x] Add frontend parser to handle `\(...\)` format (converts to $...$ for processing)
10. [x] Implement intelligent inline vs block rendering (complexity-based detection)

**Acceptance Criteria:** ✅ All Met
- ✅ LaTeX equations render beautifully in chat
- ✅ Both inline ($...$) and block ($$...$$) equations work
- ✅ Intelligent rendering: simple variables inline, complex equations block
- ✅ Supports fractions, exponents, roots, Greek letters
- ✅ Equations are readable and properly formatted
- ✅ No rendering errors for common math notation
- ✅ Handles both `$...$` and `\(...\)` formats automatically

**Files Created/Modified:**
```
frontend/src/components/MathDisplay.jsx (NEW - intelligent inline/block rendering with complexity detection + markdown parsing)
frontend/src/components/MessageList.jsx (MODIFIED - uses MathDisplay for content rendering)
frontend/src/utils/markdownParser.jsx (NEW - lightweight regex-based markdown parser)
api/services/promptService.js (MODIFIED - updated formatting instructions to use $...$ format)
```

**Sample Problems for Testing Math Rendering:**

Copy and paste these into the chat to test LaTeX rendering:

1. **Quadratic Formula:**
   ```
   Solve for x using the quadratic formula: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
   ```

2. **Linear Equation:**
   ```
   Solve: $3x + 7 = 22$
   ```

3. **Fraction Operations:**
   ```
   Simplify: $\frac{2}{3} + \frac{1}{4} = \frac{8 + 3}{12} = \frac{11}{12}$
   ```

4. **Exponents and Roots:**
   ```
   Evaluate: $x^2 = 16$ and $\sqrt{25} = 5$
   ```

5. **System of Equations:**
   ```
   Solve the system:
   $2x + y = 10$
   $x - y = 2$
   ```

**Implementation Details:**

**Math Rendering Strategy:**
- **Intelligent Format Detection**: Component automatically detects and handles `$...$`, `$$...$$`, `\(...\)`, and `\[...\]` formats
- **Smart Inline vs Block Rendering**:
  - **Always Block**: Explicit block markers (`$$...$$`, `\[...\]`)
  - **Block if Complex**: Equations with operators (`=`, `<`, `>`, `≤`, `≥`), fractions (`\frac`), roots (`\sqrt`), integrals, sums, or expressions > 15 characters
  - **Inline if Simple**: Single variables like `$x$`, `$y$`, simple references like `$x^2$`, `$x_1$`
- **Two-Pass Parsing**: Efficiently processes explicit blocks first, then single markers, avoiding overlap conflicts
- **Performance**: O(n) regex matching + O(k log k) sorting where k = number of math expressions (typically small)

**System Prompt Integration:**
- AI instructed to use `$...$` format for all equations
- Examples provided: `$x$`, `$2x + 7 = 22$`, `$\frac{a}{b}$`, `$x^2$`, `$\sqrt{25}$`
- Explicitly states: "Do NOT use \(...\) format - always use $...$ format"
- All equations render clearly on their own line for readability

**Result:**
- Simple variables like `$x$` render inline within text flow
- Complex equations render as centered block math for clarity
- Supports all LaTeX formats (normalized automatically)
- Consistent, readable formatting across all message types

**Additional Tasks:**
11. [x] Implement markdown parsing for text formatting (bold, italic, code)
    - Created lightweight regex-based markdown parser utility (`markdownParser.jsx`)
    - Processes markdown **after** math extraction (preserves math notation)
    - Supports `**bold**`, `*italic*`, and `` `code` `` formatting
    - Handles nested formatting (bold can contain italic)
    - Integrated into MathDisplay component for seamless rendering
    - Zero dependencies, efficient O(n) regex-based parsing

**Markdown Parsing Implementation:**
- **Processing Order**: Math extraction first, then markdown parsing on text parts only
- **Supported Formats**: 
  - `**bold text**` → `<strong>bold text</strong>`
  - `*italic text*` → `<em>italic text</em>`
  - `` `code` `` → `<code>` with styled background
- **Nesting Support**: Bold text can contain italic formatting
- **Performance**: Regex-based parsing with O(n) complexity, lightweight and fast
- **Integration**: Runs automatically in MathDisplay component on all text content

**Files Created/Modified:**
```
frontend/src/utils/markdownParser.jsx (NEW - lightweight markdown parser)
frontend/src/components/MathDisplay.jsx (MODIFIED - processes markdown on text parts after math extraction)
```

---

### PR #9: Canvas Component Foundation
**Priority:** P0  
**Day:** 3

**Tasks:**
- [ ] Create Whiteboard component with Canvas element
- [ ] Set up canvas context and sizing
- [ ] Implement basic coordinate system
- [ ] Create drawing state management
- [ ] Add canvas to main layout (split view with chat)
- [ ] Test canvas renders correctly
- [ ] Make canvas responsive to window resizing

**Acceptance Criteria:**
- Canvas element renders in UI
- Canvas has proper dimensions and scaling
- Layout splits screen between chat and whiteboard
- Canvas clears properly
- No visual glitches or rendering issues

**Files Created/Modified:**
```
frontend/src/components/Whiteboard.jsx
frontend/src/hooks/useCanvas.js
frontend/src/App.jsx (update layout)
```

---

### PR #10: Step Visualization Rendering on Canvas
**Priority:** P0  
**Day:** 3

**Tasks:**
- [ ] Create LaTeX-to-Canvas rendering utility
- [ ] Parse AI responses for [RENDER: ...] instructions
- [ ] Implement system layer rendering (equations, diagrams, labels)
- [ ] Position elements clearly on canvas
- [ ] Clear previous step when new step renders
- [ ] Test rendering various equation types
- [ ] Add visual distinction for system-rendered content

**Acceptance Criteria:**
- System renders equations on canvas automatically
- LaTeX equations display correctly on canvas
- Labels and annotations render clearly
- Each step clears previous step appropriately
- Multiple equation types render correctly (fractions, exponents, etc.)
- System-rendered content is visually distinct from user drawings

**Files Created/Modified:**
```
frontend/src/utils/canvasRenderer.js
frontend/src/utils/latexToCanvas.js
frontend/src/components/Whiteboard.jsx (update)
```

---

### PR #11: Drawing Lock/Unlock Mechanism
**Priority:** P0  
**Day:** 3

**Tasks:**
- [ ] Implement drawing locked/unlocked state
- [ ] Show visual indicator when drawing is locked
- [ ] Lock drawing by default at conversation start
- [ ] Unlock drawing after system renders step visualization
- [ ] Lock drawing when progressing to next step
- [ ] Disable pointer events when locked
- [ ] Test lock/unlock flow through multi-step problem

**Acceptance Criteria:**
- Drawing starts locked
- Unlocks after system renders visualization
- Locks when moving to next step
- Visual indicator clearly shows lock state
- Pointer events disabled when locked
- Flow works smoothly through entire problem

**Files Created/Modified:**
```
frontend/src/hooks/useDrawingLock.js
frontend/src/components/Whiteboard.jsx (update)
frontend/src/components/LockIndicator.jsx
```

---

### PR #12: Basic Drawing Tools (Pen & Eraser)
**Priority:** P0  
**Day:** 3

**Tasks:**
- [ ] Implement pen tool for freehand drawing
- [ ] Implement eraser tool
- [ ] Add drawing tool selector UI
- [ ] Handle pointer events (down, move, up)
- [ ] Draw smooth lines between points
- [ ] Separate user layer from system layer
- [ ] Ensure only user layer is affected by eraser
- [ ] Test drawing performance and smoothness

**Acceptance Criteria:**
- Pen tool draws smooth lines
- Eraser removes user drawings only (not system visualizations)
- Tool selector UI is clear and functional
- Drawing feels responsive (60fps)
- Multiple strokes can be drawn
- Eraser has appropriate size

**Files Created/Modified:**
```
frontend/src/components/DrawingTools.jsx
frontend/src/hooks/useDrawingTools.js
frontend/src/utils/drawingEngine.js
```

---

### PR #13: Collaborative Drawing State Management
**Priority:** P0  
**Day:** 3-4

**Tasks:**
- [ ] Save canvas state (system layer + user layer) to Firestore
- [ ] Load canvas state when retrieving conversation
- [ ] Sync canvas state across real-time updates
- [ ] Serialize/deserialize canvas drawings
- [ ] Implement canvas state per message/step
- [ ] Test drawing persistence across page refresh

**Acceptance Criteria:**
- Canvas state saves to Firestore on each step
- Canvas state loads correctly when conversation reopens
- Both system and user layers persist
- Real-time updates sync canvas between hypothetical multiple users (foundation for collaborative)
- No data loss on page refresh

**Files Created/Modified:**
```
frontend/src/hooks/useCanvasState.js
backend/services/canvasService.js
```

---

### PR #14: Color Picker & Clear Button
**Priority:** P0  
**Day:** 4

**Tasks:**
- [ ] Add color picker UI for pen tool
- [ ] Implement color selection logic
- [ ] Add clear button for user layer
- [ ] Confirm clear action with user
- [ ] Ensure clear only affects user drawings (not system visualizations)
- [ ] Test with multiple colors

**Acceptance Criteria:**
- Color picker displays available colors
- Selected color applies to pen tool
- Clear button removes all user drawings
- Confirmation dialog prevents accidental clears
- System visualizations remain after clear
- Multiple colors can be used in same drawing

**Files Created/Modified:**
```
frontend/src/components/ColorPicker.jsx
frontend/src/components/DrawingTools.jsx (update)
```

---

### PR #15: Problem Type Testing & Bug Fixes
**Priority:** P0  
**Day:** 4

**Tasks:**
- [ ] Test with simple arithmetic problem
- [ ] Test with linear equation
- [ ] Test with geometry problem
- [ ] Test with word problem
- [ ] Test with multi-step problem
- [ ] Document each test walkthrough with screenshots
- [ ] Fix bugs discovered during testing
- [ ] Refine Socratic prompting based on test results

**Acceptance Criteria:**
- Successfully guides through 5+ problem types
- No direct answers given in any test
- Whiteboard visualizations clear for each problem type
- Drawing lock/unlock works consistently
- All critical bugs fixed
- Test walkthroughs documented in EXAMPLES.md

**Files Created/Modified:**
```
docs/EXAMPLES.md
(Various bug fixes across components)
```

---

### PR #16: UI Polish & Design System
**Priority:** P0  
**Day:** 4

**Tasks:**
1. [ ] Set up SASS in Vite project (install `sass`)
2. [ ] Create design system foundation
   - [ ] Create `styles/_variables.scss` (colors, spacing, typography, breakpoints)
   - [ ] Create `styles/_mixins.scss` (reusable style patterns)
   - [ ] Create `styles/_reset.scss` (CSS reset/normalize)
   - [ ] Create `styles/global.scss` (global styles, imports)
3. [ ] Remove all inline styles and create component-level SCSS files
   - [ ] `components/Chat.module.scss`
   - [ ] `components/Login.module.scss`
   - [ ] `components/SignUp.module.scss`
   - [ ] `components/MessageList.module.scss`
   - [ ] `components/MessageInput.module.scss`
   - [ ] `components/ProtectedRoute.module.scss`
   - [ ] `App.module.scss`
4. [ ] Improve chat UI styling (spacing, colors, typography)
5. [ ] Polish whiteboard UI (borders, shadows, backgrounds)
6. [ ] Add consistent loading states (spinner during AI response)
7. [ ] Add empty states (no conversation, no messages)
8. [ ] Implement responsive layout for different screen sizes
9. [ ] Add consistent error states (API errors, upload failures)
10. [ ] Improve visual hierarchy and accessibility
11. [ ] Test on different screen sizes (desktop, tablet, mobile)

**Design System Structure:**
```
frontend/src/styles/
├── _variables.scss          # Design tokens (colors, spacing, typography)
├── _mixins.scss             # Reusable SASS mixins
├── _reset.scss              # CSS reset
├── global.scss              # Global styles (imports all base styles)
└── components/
    ├── Chat.module.scss
    ├── Login.module.scss
    ├── SignUp.module.scss
    ├── MessageList.module.scss
    ├── MessageInput.module.scss
    ├── ProtectedRoute.module.scss
    └── App.module.scss
```

**Design System Variables (Example):**
```scss
// Colors
$primary: #007bff;
$secondary: #6c757d;
$success: #28a745;
$danger: #dc3545;
$warning: #ffc107;
$info: #17a2b8;

$text-primary: #212529;
$text-secondary: #6c757d;
$bg-primary: #ffffff;
$bg-secondary: #f8f9fa;
$border-color: #dee2e6;

// Spacing (8px base)
$spacing-xs: 0.25rem;   // 4px
$spacing-sm: 0.5rem;    // 8px
$spacing-md: 1rem;      // 16px
$spacing-lg: 1.5rem;    // 24px
$spacing-xl: 2rem;      // 32px
$spacing-xxl: 3rem;     // 48px

// Typography
$font-family-base: system-ui, -apple-system, sans-serif;
$font-size-sm: 0.875rem;
$font-size-base: 1rem;
$font-size-lg: 1.125rem;
$font-size-xl: 1.25rem;
$font-size-2xl: 1.5rem;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;

// Breakpoints
$breakpoint-mobile: 480px;
$breakpoint-tablet: 768px;
$breakpoint-desktop: 1024px;
$breakpoint-wide: 1440px;

// Border radius
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;

// Shadows
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 2px 10px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 4px 20px rgba(0, 0, 0, 0.15);

// Transitions
$transition-fast: 150ms ease-in-out;
$transition-base: 300ms ease-in-out;
$transition-slow: 500ms ease-in-out;
```

**Acceptance Criteria:**
- SASS properly configured in Vite
- Design system with comprehensive variables established
- All inline styles removed and replaced with CSS Modules
- Consistent spacing, colors, and typography throughout app
- UI looks professional and polished
- All loading states display correctly with consistent styling
- Empty states guide user on what to do
- Error messages are helpful and user-friendly
- Layout works on desktop (1920x1080 and 1366x768)
- Responsive on tablet (768px) and mobile (480px)
- Visual hierarchy is clear (user knows where to look)
- Accessibility considerations (contrast, focus states)

**Files Created/Modified:**
```
frontend/package.json (add sass dependency)
frontend/vite.config.js (configure SASS if needed)

frontend/src/styles/
├── _variables.scss
├── _mixins.scss
├── _reset.scss
├── global.scss
└── components/
    ├── Chat.module.scss
    ├── Login.module.scss
    ├── SignUp.module.scss
    ├── MessageList.module.scss
    ├── MessageInput.module.scss
    ├── ProtectedRoute.module.scss
    └── App.module.scss

frontend/src/main.jsx (import global.scss)

frontend/src/components/ (update all components to use CSS Modules)
├── Chat.jsx
├── Login.jsx
├── SignUp.jsx
├── MessageList.jsx
├── MessageInput.jsx
├── ProtectedRoute.jsx

frontend/src/App.jsx
```

**Why This Approach:**
- **SASS Variables** - Centralized design tokens, easy to theme
- **CSS Modules** - Scoped styles, no class name conflicts
- **Component-level files** - Co-located with components, easy to maintain
- **Design System** - Consistent spacing, colors, typography across app
- **Scalable** - Easy to add new components with consistent styling
- **Professional** - Industry-standard approach for React apps

---

### PR #17: Documentation & Setup Instructions
**Priority:** P0  
**Day:** 5

**Tasks:**
1. [x] Write comprehensive README.md
2. [x] Create SETUP.md with step-by-step instructions
3. [x] Document environment variables needed (create .env.example files)
4. [x] Add Firebase setup instructions (detailed step-by-step)
5. [x] Add OpenAI API key setup (detailed instructions)
6. [x] Document local development workflow
7. [x] Add troubleshooting section (common issues and solutions)
8. [x] Create ARCHITECTURE.md that references architecture.mermaid

**Acceptance Criteria:**
- README clearly explains project
- SETUP.md allows someone to run project from scratch
- All required environment variables listed
- Firebase and OpenAI setup clearly explained
- Troubleshooting covers common issues

**Files Created/Modified:**
```
README.md (MODIFIED - comprehensive overview with environment variable examples and links to setup docs)
SETUP.md (NEW - detailed step-by-step setup instructions with complete environment variable examples)
ARCHITECTURE.md (NEW - system architecture documentation referencing architecture.mermaid)
```

---

### PR #18: Deployment to Vercel
**Priority:** P0  
**Day:** 5

**Tasks:**
1. [x] Configure Vercel project for frontend
2. [ ] Set up environment variables in Vercel dashboard
3. [x] Configure `vercel.json` with proper build settings
4. [ ] Deploy Express backend to Vercel (Vercel auto-wraps Express as serverless functions)
5. [ ] Test frontend deployment
6. [ ] Test backend API routes in production (Express routes work as serverless endpoints)
7. [ ] Verify Firebase connection in production
8. [ ] Test end-to-end flow in production
9. [ ] Fix any production-specific bugs

**Acceptance Criteria:**
- Frontend deployed and accessible via public URL
- Express backend deployed to Vercel (auto-converted to serverless)
- Backend API routes work in production with no cold start issues
- Environment variables configured correctly in Vercel
- Firebase works in production environment
- Image upload works in production
- Chat functionality works end-to-end
- No console errors in production

**Files Created/Modified:**
```
vercel.json (MODIFIED - configured for frontend build and backend serverless functions)
  - Frontend: Builds from frontend/ directory, outputs to frontend/dist
  - Backend: Serverless function at api/index.js with @vercel/node runtime
  - Routes: /api/* requests go to backend, all other requests serve frontend
  - Install: Installs dependencies for both frontend and backend
```

---

### PR #19: Demo Video & Final QA
**Priority:** P0  
**Day:** 5

**Tasks:**
- [ ] Record 5-minute demo video
  - [ ] Introduction (30s)
  - [ ] Text input demo (1m)
  - [ ] Image upload demo (1m)
  - [ ] Socratic dialogue demo (1.5m)
  - [ ] Whiteboard demo (1m)
  - [ ] Conclusion (30s)
- [ ] Final QA pass on production
- [ ] Test all 5 problem types in production
- [ ] Fix any last-minute issues
- [ ] Update documentation with production URL

**Acceptance Criteria:**
- Demo video recorded and uploaded
- All features demonstrated in video
- Production app passes final QA
- Documentation includes production URL
- All deliverables complete

**Files Created/Modified:**
```
docs/DEMO_VIDEO.md (link to video)
README.md (update with production URL)
```

---

## Priority 1 (P1) - High-Value Features (Post-P0)

These PRs enhance the core experience but require P0 foundation to be complete first.

---

### PR #19: Interactive Whiteboard Enhancement
**Priority:** P1  
**Day:** 3-4 (after PR #13)

**Tasks:**
- [ ] Add pan and zoom functionality
- [ ] Implement touch support for tablets
- [ ] Add undo/redo for drawings
- [ ] Improve drawing smoothness (line smoothing algorithm)
- [ ] Add highlighter tool (semi-transparent)
- [ ] Add shape tools (line, circle, rectangle) - optional
- [ ] Test on different devices

**Acceptance Criteria:**
- Pan and zoom work smoothly
- Touch drawing works on tablets
- Undo/redo work correctly (up to 20 steps)
- Drawing feels very smooth
- Highlighter tool works with transparency
- All tools tested on desktop and tablet

**Files Created/Modified:**
```
frontend/src/hooks/useCanvasZoom.js
frontend/src/utils/lineSmoothing.js
frontend/src/hooks/useDrawingHistory.js
```

---

### PR #20: Advanced Image Parsing (Handwritten)
**Priority:** P1  
**Day:** 2-3 (after PR #6)

**Tasks:**
- [ ] Test Vision API with handwritten math problems
- [ ] Improve prompt for better handwriting recognition
- [ ] Add confidence scores for parsed text
- [ ] Allow user to correct parsed text before starting
- [ ] Test with various handwriting styles
- [ ] Document handwriting recognition limitations

**Acceptance Criteria:**
- Handwritten problems parse with >70% accuracy
- User can edit parsed text before confirming
- Clear messaging when confidence is low
- Documentation notes which handwriting styles work best

**Files Created/Modified:**
```
backend/services/visionService.js (update)
frontend/src/components/ParsedProblemConfirmation.jsx
```

---

## Priority 2 (P2) - Voice Interface (Post-P0 & P1)

This PR should only be started after all P0 features are complete and polished.

---

### PR #21: Voice Interface (TTS + STT)
**Priority:** P2  
**Day:** 4-5 (only after whiteboard + step viz are polished)

**Tasks:**
- [ ] Install Web Speech API (browser native)
- [ ] Implement Text-to-Speech for tutor responses
- [ ] Implement Speech-to-Text for student input
- [ ] Add microphone button UI
- [ ] Add speaker toggle button UI
- [ ] Implement voice activity indicator (waveform or pulsing)
- [ ] Handle browser compatibility (feature detection)
- [ ] Add error handling for voice failures
- [ ] Test on multiple browsers
- [ ] Fallback to text-only if voice not supported

**Acceptance Criteria:**
- TTS reads tutor responses aloud
- STT captures student speech and converts to text
- Microphone button starts/stops listening
- Speaker button enables/disables TTS
- Visual feedback shows when voice is active
- Works on Chrome, Firefox, Safari, Edge
- Graceful fallback when voice not supported
- Error messages help user troubleshoot

**Files Created/Modified:**
```
frontend/src/components/VoiceControls.jsx
frontend/src/hooks/useTextToSpeech.js
frontend/src/hooks/useSpeechToText.js
frontend/src/utils/voiceFeatureDetection.js
```

---

## Summary: MVP PR Sequence

### Week 1 (Days 1-5)

**Day 1: Foundation**
- PR #1: Project setup
- PR #2: Basic chat UI
- PR #3: Socratic prompting

**Day 2: Input & Persistence**
- PR #4: Firestore integration
- PR #5: Image upload UI
- PR #6: Image parsing (printed)
- PR #7: Math rendering

**Day 3: Whiteboard Core**
- PR #8: Canvas foundation
- PR #9: Step visualization
- PR #10: Drawing lock/unlock
- PR #11: Drawing tools
- PR #12: Canvas state management

**Day 4: Polish & Enhancements**
- PR #13: Color picker & clear
- PR #14: Problem testing & bugs
- PR #15: UI polish
- PR #19: Whiteboard enhancements (P1)
- PR #20: Handwritten parsing (P1)

**Day 5: Deployment & Documentation**
- PR #16: Documentation
- PR #17: Vercel deployment
- PR #18: Demo video & QA
- PR #21: Voice interface (P2) - only if time permits

---

## Critical Path

**Must Complete for MVP:**
- PR #1 → #2 → #3 (Day 1: Chat foundation)
- PR #4 → #5 → #6 (Day 2: Input system)
- PR #7 (Math rendering - can parallel with #4-6)
- PR #8 → #9 → #10 → #11 → #12 (Day 3: Whiteboard)
- PR #13 → #14 → #15 (Day 4: Testing & polish)
- PR #16 → #17 → #18 (Day 5: Ship it)

**Optional if Time Permits:**
- PR #19: Whiteboard enhancements
- PR #20: Handwritten support
- PR #21: Voice interface

**Not in MVP (Stretch Goals):**
- Animation for step visualization
- Animated avatar
- Difficulty modes
- Problem generation
- Image cleanup with TTL

---

## Notes on Prioritization

**Why This Order:**

1. **P0 First:** All core features must work before adding enhancements
2. **Chat Before Canvas:** Need working AI conversation before visual features
3. **Canvas Foundation Before Drawing:** Rendering must work before interaction
4. **Drawing Before Voice:** Visual learning is more critical than audio
5. **Testing Before Deployment:** Can't ship untested code
6. **Voice Last:** Nice-to-have that can be dropped if timeline is tight

**Decision Points:**

- **End of Day 3:** Assess if whiteboard is on track. If behind, skip PR #19.
- **End of Day 4:** Assess if ready to deploy. If behind, skip PR #20 and #21.
- **Day 5 Morning:** Make final call on voice interface (PR #21) based on overall status.

**Quality Gates:**

- Don't move to next priority tier until current tier is polished
- If running behind, cut lower priority features rather than ship buggy code
- Voice (P2) is explicitly optional - only add if P0 is perfect

---

## PR Best Practices

**Each PR Should:**
- [ ] Have a clear, single focus
- [ ] Include tests (manual testing checklist minimum)
- [ ] Update relevant documentation
- [ ] Have descriptive commit messages
- [ ] Be small enough to review in 15-30 minutes
- [ ] Pass all acceptance criteria before merging

**Branch Naming Convention:**
```
feature/pr-01-project-setup
feature/pr-02-chat-ui
feature/pr-03-socratic-prompting
...
```

**Commit Message Format:**
```
[PR-01] Initialize React + Vite project

- Set up project structure
- Configure environment variables
- Add Firebase connection
```

---

*End of PR Breakdown*