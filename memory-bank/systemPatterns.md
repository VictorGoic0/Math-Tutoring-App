# System Patterns

## Architecture Overview

The application follows a client-server architecture with real-time synchronization via Firestore:

```
Frontend (React + Vite)
  ↓ HTTP
Backend (Express.js)
  ↓ API
OpenAI GPT-4 Vision
  ↓
Firebase Firestore (Real-time persistence)

Deployment: Both frontend and Express backend deployed to Vercel
(Vercel auto-wraps Express routes as serverless functions)
```

## Component Architecture

### Frontend Structure

```
App.jsx
├── Chat Component
│   ├── MessageList
│   ├── MessageInput
│   ├── ImageUpload
│   └── MathDisplay (KaTeX)
├── Whiteboard Component
│   ├── Canvas (HTML5 Canvas API)
│   ├── DrawingTools
│   └── LockIndicator
└── VoiceControls (P2)
```

### Backend Structure

```
Express Server
├── Routes
│   ├── /api/chat (POST)
│   ├── /api/upload (POST)
│   └── /api/conversation/:id (GET)
└── Services
    ├── promptService.js (Socratic prompts)
    ├── contextManager.js (Conversation state)
    ├── visionService.js (Image parsing)
    ├── firestoreService.js (Persistence)
    └── canvasService.js (Canvas state)
```

## Key Design Patterns

### 1. Socratic Dialogue Pattern

**System Prompt Framework:**
- NEVER provide direct answers
- Guide through questions leading to discovery
- Hint triggers: 2+ stuck turns → provide concrete hint
- Adaptive scaffolding based on understanding level

**Context Management:**
```javascript
{
  problemText: string,
  currentStep: int,
  studentUnderstanding: 'struggling' | 'progressing' | 'excelling',
  stuckTurns: int,
  hintsGiven: int,
  conversationHistory: Message[]
}
```

### 2. Drawing Lock/Unlock Pattern

**State Flow:**
1. Conversation starts → Drawing LOCKED
2. System renders step visualization
3. Drawing UNLOCKS (student can annotate)
4. Progress to next step → Drawing LOCKS
5. Repeat

**Implementation:**
- Visual indicator shows lock state
- Pointer events disabled when locked
- State tied to step progression

### 3. Canvas Layer Pattern

**Two-Layer Architecture:**
- **Layer 1 (Bottom):** System-rendered visualizations (equations, diagrams, labels)
- **Layer 2 (Top):** User annotations and drawings

**Visual Distinction:**
- System content: Black, formatted equations
- User drawings: Blue/Red, freehand strokes

### 4. Real-time Synchronization Pattern

**Firestore Real-time Listeners:**
- Frontend subscribes to conversation/message updates
- Changes sync automatically without refresh
- Canvas state persists per message/step

**Data Flow:**
1. User action (message/drawing)
2. Save to Firestore
3. Firestore listener triggers update
4. UI updates automatically

### 5. Math Rendering Pattern

**Hybrid Approach:**
- **Chat UI:** KaTeX for DOM rendering (fast, beautiful)
- **Whiteboard:** LaTeX-to-Canvas rendering (for step visualizations)

**Parsing:**
- Extract LaTeX from AI responses
- Parse `[RENDER: ...]` instructions
- Render equations with proper positioning

## Component Relationships

### Chat → Whiteboard Integration
- Chat messages trigger step visualizations
- Canvas state updates based on conversation flow
- Drawing lock state tied to message progression

### Image Upload → Vision → Chat
- Image uploaded → Backend processes via Vision API
- Parsed problem text → Displayed in chat
- Confirmation → Conversation begins

### Conversation → Persistence
- Each message saved to Firestore
- Canvas state serialized per message
- Real-time listeners keep UI in sync

## State Management

### Frontend State
- React hooks for component state
- `useChat` hook from Vercel AI SDK for chat UI (configured to call `/api/chat`, never OpenAI directly)
- Custom hooks: `useCanvas`, `useDrawingLock`, `useConversation`
- Firestore listeners for real-time updates

### Backend State
- Conversation context in memory (per request)
- Firestore for persistence
- No session storage (stateless server)

## Error Handling Patterns

1. **Graceful Degradation:**
   - Voice fails → Fallback to text-only
   - Image parsing fails → Show error, allow retry
   - Network error → Show message, retry button

2. **User Feedback:**
   - Loading states for async operations
   - Error messages are helpful and actionable
   - Empty states guide user on next steps

## Security Patterns

- API keys stored in environment variables
- Firebase security rules for data access
- Image upload size limits (10MB max)
- CORS configured for frontend origin only

