# Active Context

## Current Work Focus

**Status:** PR #5 Complete & Tested  
**Phase:** Day 2 - Core Features Complete, Ready for PR #6

PRs #1-5 are complete and tested. The full tutoring system works end-to-end:
- Chat interface with streaming AI responses
- Socratic teaching system with adaptive scaffolding
- Conversation persistence with Firestore
- History loads on page refresh
- Single conversation per user (simplified MVP approach)

Ready to begin PR #6: Image Upload UI

## Recent Changes

### Just Completed (PR #5) - Firestore Integration
- ✅ Created Firestore collections: `/conversations/{id}` → `/messages/{id}`
- ✅ Implemented single-conversation-per-user pattern (get-or-create)
- ✅ Built full REST API for conversations and messages
- ✅ Created `GET /api/chat/history` endpoint
- ✅ Frontend services layer: `api.js` + `chatService.js`
- ✅ Simple persistence model: local state during session, DB on reload
- ✅ Delete conversation button for testing
- ✅ No real-time listeners (avoids race conditions)
- ✅ In-memory sorting (no composite index needed)
- ✅ Fixed Firestore index issue

### Recently Completed (PR #4) - Socratic Prompting
- ✅ Complete Socratic system prompt with adaptive scaffolding
- ✅ Context manager (stateless) tracking student progress
- ✅ Detects stuck turns, triggers hints appropriately
- ✅ Plain text math formatting (no LaTeX escaping)
- ✅ Comprehensive CONTEXT_MANAGER.md documentation

### Previously Completed (PR #1, #2, #3)
- ✅ React + Vite frontend + Express backend
- ✅ Firebase Auth (login, signup, protected routes)
- ✅ Chat UI with useChat hook (AI SDK v3)
- ✅ OpenAI GPT-4 Turbo streaming
- ✅ Comprehensive error handling

## Next Steps

### Immediate - Start PR #6
**PR #6: Image Upload UI**
- Image upload button in chat interface
- File input with image preview
- Multiple image selection support
- Loading state during upload
- Display uploaded images in conversation
- File size/type validation

### After PR #6
**PR #7: OpenAI Vision Integration**
- Send images to GPT-4 Vision API
- Extract math problems from images
- Display extracted text for user confirmation
- Handle image + text in same message

## Active Decisions & Architecture

### Key Architecture Decisions Made

1. **Single Conversation Per User (PR #5)**
   - Simplifies MVP
   - Auto-creates on first message
   - No conversation selection UI needed
   - Easy to extend to multiple conversations later

2. **Simple Persistence Model (PR #5)**
   - useChat manages local state during session
   - Firestore stores history
   - Load on page refresh
   - No real-time listeners (avoids race conditions)
   - No streaming persistence (simpler, more reliable)

3. **Stateless Context Manager (PR #4)**
   - Analyzes messages array each request
   - No database state to manage
   - Easy to migrate to stateful later
   - Works perfectly for single conversation

4. **Frontend Services Layer (PR #5)**
   - Services pattern over custom hooks
   - Clean API abstraction
   - `api.js` base client + `chatService.js`
   - Easy to test and extend

5. **AI SDK v3 (PR #3)**
   - Broader model compatibility
   - Simpler streaming API
   - Stable, well-documented

### Pending Decisions
1. **Image Storage:** Base64 in messages vs. Firebase Storage URLs
2. **Canvas Rendering Library:** How to render LaTeX on canvas
3. **Voice Implementation:** Decide if voice (P2) included in MVP

### Current Priorities
- **P0 Features First:** Core functionality before enhancements
- **Image Upload Next:** Enable visual problem input
- **Canvas Foundation:** Need visual feedback for steps
- **Testing Critical:** Verify each feature works

## Current Blockers

None! Ready to proceed with PR #6.

## System Architecture Summary

### Frontend (`frontend/src/`)
```
components/
  ├── Chat.jsx              (main chat interface)
  ├── MessageList.jsx       (displays messages)
  ├── MessageInput.jsx      (text input)
  ├── Header.jsx            (navigation + logout)
  ├── Login.jsx
  └── SignUp.jsx

services/
  ├── api.js                (base API client)
  └── chatService.js        (chat API calls)

hooks/
  └── useAuth.js            (auth state management)
```

### Backend (`api/`)
```
routes/
  ├── chat.js               (POST /api/chat, GET /api/chat/history)
  └── conversation.js       (full CRUD for conversations)

services/
  ├── promptService.js      (Socratic prompts)
  ├── contextManager.js     (adaptive scaffolding)
  ├── conversationManager.js (single conversation logic)
  └── firestoreService.js   (Firestore CRUD)

middleware/
  └── auth.js               (verifyAuthToken)
```

### Data Flow
```
1. Page load → GET /api/chat/history → load messages
2. User types → useChat local state updates
3. Submit → POST /api/chat → streams AI response
4. AI responds → useChat updates in real-time
5. Page refresh → repeat step 1
```

## Testing Strategy

### Completed Testing
- ✅ Chat streaming works
- ✅ Auth flow end-to-end
- ✅ Socratic prompting (guides without answers)
- ✅ Context detection (stuck turns)
- ✅ History persistence across refreshes
- ✅ Delete conversation

### Upcoming Testing
- [ ] Image upload and preview
- [ ] Image parsing with Vision API
- [ ] Multiple images in one message
- [ ] Canvas rendering
- [ ] Drawing tools
- [ ] Lock/unlock mechanism

## Documentation Status

### Created
- ✅ `CONTEXT_MANAGER.md` - Full context manager docs
- ✅ `tasks.md` - All PRs documented
- ✅ Memory bank updated (progress, activeContext, techContext)

### Needed
- [ ] README.md with setup instructions
- [ ] .env.example files
- [ ] EXAMPLES.md with problem walkthroughs

## Progress Metrics

- **PRs Complete:** 5 of 19 (26%)
- **Phase:** Day 2 of 5
- **Status:** Ahead of schedule
- **Core System:** Fully functional
- **Next Milestone:** Image upload working
