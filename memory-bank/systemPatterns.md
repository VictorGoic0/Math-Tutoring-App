# System Patterns

## Architecture Overview

The application follows a clean separation between frontend and backend, with Firebase as the persistence layer. The backend is a pure OpenAI API proxy, while the frontend handles all user interactions and Firestore operations directly.

```
Frontend (React) → Backend (Express) → OpenAI API
     ↓
Firebase (Firestore + Storage)
```

## Key Design Patterns

### 1. Optimistic UI Updates

**Pattern:** Messages appear instantly in UI, Firebase saves happen in background

**Implementation:**
- User message → immediately added to local state
- AI response → streams and updates in real-time
- Firebase persistence → non-blocking async operations
- Errors logged but don't block UI

**Files:**
- `frontend/src/components/Chat.jsx` - Optimistic message updates
- `frontend/src/services/chatService.js` - Non-blocking Firebase saves

### 2. Single Conversation Per User

**Pattern:** Each user has one ongoing conversation (auto-created on first message)

**Implementation:**
- Get-or-create pattern: Check if conversation exists, create if not
- Conversation ID stored in component state
- All messages belong to same conversation
- Simplified MVP approach (no conversation switching)

**Files:**
- `frontend/src/services/chatService.js` - `createConversation()` and `loadConversationHistory()`

### 3. Manual State Management (No useChat Hook)

**Pattern:** Full control over chat state with `useState` hooks

**Implementation:**
- `messages` state array
- `input` state for text input
- `isLoading` state for AI response
- Manual streaming via `fetch` + `parseAIStream`
- More control, simpler debugging

**Files:**
- `frontend/src/components/Chat.jsx` - Manual state management
- `frontend/src/services/api.js` - `parseAIStream()` utility

### 4. Frontend-Direct Firestore Operations

**Pattern:** All Firestore reads/writes happen from frontend, backend never touches Firestore

**Rationale:**
- Firebase Admin SDK incompatible with Vercel serverless cold starts
- Firestore Security Rules enforce access control at database level
- Simpler architecture, fewer failure points
- Direct client-to-Firestore calls are faster

**Files:**
- `frontend/src/services/chatService.js` - All Firestore operations
- `frontend/src/utils/firebase.js` - Firebase client SDK initialization

### 5. Backend as Pure OpenAI Proxy

**Pattern:** Backend only handles OpenAI API calls, no database operations

**Implementation:**
- Single route: `POST /chat`
- Accepts messages array + optional imageUrl
- Streams response via Server-Sent Events (SSE)
- No authentication (security handled by Firestore rules)

**Files:**
- `api/routes/chat.js` - OpenAI API proxy
- `api/services/promptService.js` - Socratic system prompt
- `api/services/contextManager.js` - Adaptive scaffolding logic

### 6. Adaptive Scaffolding

**Pattern:** AI adjusts teaching approach based on student understanding level

**Implementation:**
- Context manager analyzes conversation history
- Detects stuck turns, confusion indicators
- Dynamically enhances system prompt with scaffolding instructions
- Hints trigger after 2+ stuck turns

**Files:**
- `api/services/contextManager.js` - Context analysis and adaptive instructions
- `api/services/promptService.js` - System prompt generation with context

### 7. Design System Integration

**Pattern:** Consistent UI components using shared design tokens

**Implementation:**
- `Input`, `Card`, `Button` components from design system
- Design tokens: `colors`, `typography`, `spacing`, `borderRadius`, `shadows`, `transitions`
- Styles declared outside components (unless dynamic)
- Consistent styling across all components

**Files:**
- `frontend/src/components/design-system/` - Design system components
- `frontend/src/styles/tokens.js` - Design tokens

### 8. Math Rendering with KaTeX

**Pattern:** Intelligent inline vs block rendering based on equation complexity

**Implementation:**
- Parse LaTeX notation (`$...$`, `$$...$$`, `\(...\)`, `\[...\]`)
- Simple variables → inline rendering
- Complex equations → block rendering (centered, on own line)
- Markdown parsing on text parts (bold, italic, code)

**Files:**
- `frontend/src/components/MathDisplay.jsx` - Intelligent math rendering
- `frontend/src/utils/markdownParser.jsx` - Markdown parsing

### 9. AI Tool Calling for Canvas Rendering

**Pattern:** AI uses structured tools to render visualizations on canvas

**Implementation:**
- Backend defines tool schemas with Zod validation
- Vercel AI SDK v5 `streamText` with `tools` parameter
- Manual SSE streaming via `fullStream` (Express compatibility)
- Frontend parser extracts tool calls from SSE data stream
- Tool calls dispatched to canvas store for rendering

**Tool Types:**
- `render_equation`: LaTeX equations with auto-positioning
- `render_label`: Text annotations with styling
- `render_diagram`: Geometric shapes (lines, circles, rectangles, polygons, arrows, parabolas)
- `clear_canvas`: Clear previous step visualizations

**Files:**
- `api/routes/chat.js` - Tool schemas, SSE streaming
- `api/services/promptService.js` - Tool usage instructions with few-shot examples
- `frontend/src/services/api.js` - SSE parser (`parseAIStreamRender`)
- `frontend/src/components/Chat.jsx` - Tool call extraction and canvas store updates

### 10. Graph Rendering System Architecture (New - v2.0)

**Pattern:** Three-layer canvas with fixed coordinate bounds and frontend-controlled rendering

**Key Design Principles:**
- **LLM provides minimal data:** Equations or coordinates only, NO styling parameters
- **Frontend controls everything:** Colors, line widths, labels, all rendering logic
- **Fixed coordinate bounds:** -10 to +10 on both axes (standard 4-quadrant plane)
- **Zustand for state:** Centralized store for all canvas state
- **Deterministic rendering:** Same equation/coordinates always render identically

**Tool Set (5 tools):**
1. `draw_linear_function` - Equation string only (e.g., "2*x + 3")
2. `draw_quadratic_function` - Equation string only (e.g., "x^2 - 4")
3. `draw_circle` - Center coordinates + radius
4. `draw_square` - Four corner coordinates
5. `draw_triangle` - Three vertex coordinates

**Architecture:**
```
Layer 1: Grid (static background, -10 to +10)
Layer 2: System Renders (AI equations/shapes, blue #2563eb)
Layer 3: User Strokes (future - student drawings)
```

**State Management:**
```javascript
canvasStore: {
  bounds: { xMin: -10, xMax: 10, yMin: -10, yMax: 10, width, height },
  systemRenders: [{ type, params, id, timestamp }],
  userStrokes: [],
  actions: { addSystemRender, clearSystemRenders, clearAllCanvas }
}
```

**Rendering Constants (Frontend):**
- System color: `#2563eb` (blue)
- System line width: `2px`
- User color: `#10b981` (green, future)
- User line width: `2px`

**Files:**
- `frontend/src/stores/canvasStore.js` - Zustand store with fixed bounds
- `frontend/src/components/GraphCanvas.jsx` - Canvas component
- `frontend/src/utils/coordinateTransform.js` - worldToCanvas/canvasToWorld
- `frontend/src/utils/gridRenderer.js` - Grid with axes and labels
- `frontend/src/utils/shapeRenderer.js` - All shape rendering functions
- `frontend/src/hooks/useChatToolCalls.js` - Tool call parser

**Documentation:**
- `Graph-Revamp-TDD.md` - Complete technical design (v2.0)
- `tasks-3.md` - Implementation task breakdown (10 MVP + 5 post-MVP PRs)

### 11. Canvas UI with Hide/Show Toggle

**Pattern:** Canvas hidden by default, auto-shows when AI draws, smooth animations

**Implementation:**
- Canvas visibility controlled by local state in App.jsx
- Watches `systemRenders` from canvasStore - auto-shows when length > 0
- Smooth animations: 0.3s `cubic-bezier(0.4, 0.0, 0.2, 1)` for flex changes
- `willChange: 'flex'` CSS hint prevents layout thrashing
- Fixed positioning for toggle button to prevent jitter
- Layout: 65% canvas / 35% chat when visible, chat centered at 50% max-width when hidden

**Files:**
- `frontend/src/App.jsx` - Canvas visibility, toggle button, responsive layout

## Component Relationships

### Chat Component Hierarchy

```
App.jsx
└── ProtectedRoute
    └── Chat.jsx
        ├── MessageList.jsx
        │   └── MathDisplay.jsx (for each message)
        └── MessageInput.jsx
            └── Button (upload image)
```

### State Flow

1. **User sends message:**
   - `Chat.jsx` → `handleSubmit()` → optimistic UI update
   - `Chat.jsx` → `persistUserMessage()` → background Firebase save
   - `Chat.jsx` → `fetch('/chat')` → backend streaming response
   - `Chat.jsx` → `parseAIStream()` → real-time message updates
   - `Chat.jsx` → `persistAIMessage()` → background Firebase save

2. **Page refresh:**
   - `Chat.jsx` → `useEffect` → `loadConversationHistory()`
   - `chatService.js` → Firestore query → load messages
   - `Chat.jsx` → `setMessages()` → initialize state

## Data Models

### Conversation (Firestore)
```javascript
{
  id: string,
  userId: string,
  title: string, // Auto-generated from first message
  createdAt: timestamp,
  updatedAt: timestamp,
  messageCount: number,
  lastMessage: string
}
```

### Message (Firestore Subcollection)
```javascript
{
  id: string,
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  imageUrl?: string, // If user uploaded image
  timestamp: timestamp
}
```

## API Patterns

### Streaming Response

**Backend:**
```javascript
const result = streamText({ ... });
return result.pipeTextStreamToResponse(res);
```

**Frontend:**
```javascript
const response = await fetch('/chat', { ... });
const reader = response.body.getReader();
// Parse SSE stream and update message in real-time
```

### Error Handling

**Backend:**
- Try-catch blocks in all route handlers
- Production-safe error messages (hide sensitive details)
- HTTP status codes: 400 (Bad Request), 500 (Server Error)

**Frontend:**
- Graceful error handling with user-friendly messages
- Firebase auth errors mapped to readable messages
- Network errors show retry options

## Security Patterns

1. **Firestore Security Rules:** Enforce user can only access their own conversations
2. **No Server-Side Auth:** Backend doesn't verify tokens (Firestore rules handle it)
3. **Environment Variables:** `VITE_*` prefixed vars only in frontend, server vars only in backend
4. **OpenAI API Key:** Stored server-side only, never exposed to browser

## Deployment Patterns

1. **Separate Vercel Projects:** Frontend and backend deployed as separate projects
2. **Root Directory:** Vercel Root Directory setting strips `/api` prefix from routes
3. **SPA Routing:** `frontend/vercel.json` rewrites all routes to `/index.html`
4. **Serverless Functions:** Express routes auto-wrapped as serverless functions

