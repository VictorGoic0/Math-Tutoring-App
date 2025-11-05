# Technical Context

## Technology Stack

### Frontend

**Core:**
- React 19+ with Vite
- React Router for client-side routing
- Firebase SDK (Auth, Firestore, Storage)

**UI Libraries:**
- KaTeX for math rendering
- Custom design system components (Input, Card, Button)
- Design tokens for consistent styling

**State Management:**
- React Context API (AuthContext)
- useState hooks for local component state
- Manual state management (removed useChat hook)

**File Structure:**
```
frontend/src/
├── components/
│   ├── Chat.jsx (main chat interface)
│   ├── MessageList.jsx (message display)
│   ├── MessageInput.jsx (input with image upload)
│   ├── MathDisplay.jsx (LaTeX rendering)
│   ├── Login.jsx, SignUp.jsx (authentication)
│   └── design-system/ (shared UI components)
├── contexts/
│   └── AuthContext.jsx (global auth state)
├── hooks/
│   └── useAuth.js (auth hook)
├── services/
│   ├── api.js (API utilities, parseAIStream)
│   ├── chatService.js (Firestore operations)
│   └── storageService.js (image upload)
├── utils/
│   ├── firebase.js (Firebase initialization)
│   ├── authErrors.js (error message mapping)
│   └── markdownParser.jsx (markdown parsing)
└── styles/
    └── tokens.js (design tokens)
```

### Backend

**Core:**
- Express.js (Node.js)
- Vercel AI SDK v5 for OpenAI integration
- Deployed as Vercel serverless functions

**AI Integration:**
- OpenAI GPT-4 Vision (gpt-4o) for image parsing
- OpenAI GPT-4 Turbo (gpt-4-turbo) for text-only conversations
- Socratic prompting system with adaptive scaffolding

**File Structure:**
```
api/
├── index.js (Vercel entry point)
├── server.js (Express app setup)
├── routes/
│   └── chat.js (POST /chat endpoint)
└── services/
    ├── promptService.js (Socratic system prompt)
    └── contextManager.js (adaptive scaffolding)
```

### Database & Storage

**Firebase:**
- Firestore for conversation persistence
- Firebase Storage for image uploads
- Firebase Auth for user authentication

**Data Model:**
- Collections: `conversations` (parent), `messages` (subcollection)
- Single conversation per user (simplified MVP)
- Optimistic UI with background persistence

### Deployment

**Platform:** Vercel

**Configuration:**
- Frontend: Separate Vercel project, Root Directory: `/frontend`
- Backend: Separate Vercel project, Root Directory: `/api`
- Environment variables isolated per project

**Vercel Config Files:**
- `frontend/vercel.json` - SPA routing rewrites
- `api/vercel.json` - Serverless function configuration

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account (free tier)
- OpenAI API key with GPT-4 access

### Environment Variables

**Frontend (`frontend/.env`):**
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:3000 (or production URL)
```

**Backend (`api/.env`):**
```env
OPENAI_API_KEY=...
FRONTEND_URL=http://localhost:5173 (or production URL)
```

### Local Development

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

**Backend:**
```bash
cd api
npm install
npm run dev  # Runs on http://localhost:3000
```

### Build & Deploy

**Frontend:**
- Vite automatically builds for production
- Vercel detects Vite and configures automatically

**Backend:**
- Express routes auto-wrapped as serverless functions
- `api/index.js` is the Vercel entry point

## Key Dependencies

### Frontend

```json
{
  "react": "^19.x",
  "react-dom": "^19.x",
  "react-router-dom": "^6.x",
  "firebase": "^10.x",
  "katex": "^0.16.x",
  "react-katex": "^3.x"
}
```

### Backend

```json
{
  "express": "^4.x",
  "ai": "^5.0.76",
  "@ai-sdk/openai": "^0.x",
  "cors": "^2.x",
  "dotenv": "^16.x"
}
```

## Technical Constraints

### Vercel Serverless Limitations

1. **Cold Starts:** Functions may have cold start delays (1-2 seconds)
2. **Execution Time:** 10-second timeout on Hobby plan, 60 seconds on Pro
3. **Environment Variables:** Must be set in Vercel dashboard, not `.env` files
4. **File System:** Read-only, can't write temporary files

### Firebase Admin SDK Removal

**Why Removed:**
- Incompatible with Vercel serverless cold starts
- Environment variables not available at module load time
- Lazy initialization attempts still failed intermittently

**Solution:**
- All Firestore operations moved to frontend
- Firestore Security Rules enforce access control
- Simpler, more reliable architecture

### Browser Compatibility

**Supported:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Features:**
- KaTeX rendering: Works in all modern browsers
- Firebase SDK: Works in all modern browsers
- Web Speech API: Varies by browser (Chrome best support)

## Development Workflow

### Code Organization

1. **Components:** One file per component, co-located styles
2. **Services:** API calls and Firestore operations
3. **Utils:** Helper functions, Firebase initialization
4. **Styles:** Design tokens in `styles/tokens.js`

### State Management

1. **Global State:** AuthContext for user authentication
2. **Local State:** useState hooks in components
3. **No Global State Library:** Redux/Zustand not needed for MVP

### Error Handling

1. **Backend:** Try-catch blocks, HTTP status codes, production-safe messages
2. **Frontend:** User-friendly error messages, graceful degradation
3. **Firebase Errors:** Mapped to readable messages in `authErrors.js`

## Performance Considerations

1. **Optimistic UI:** Messages appear instantly, no waiting for persistence
2. **Streaming Responses:** AI responses stream in real-time (SSE)
3. **Image Optimization:** Images uploaded to Firebase Storage, not base64
4. **Lazy Loading:** Components loaded on demand (planned)
5. **Firestore Queries:** Limited to 100 messages per conversation (configurable)

## Security Considerations

1. **Firestore Rules:** Enforce user can only access their own conversations
2. **OpenAI API Key:** Server-side only, never exposed to browser
3. **CORS:** Configured for production frontend URL
4. **Environment Variables:** Isolated per Vercel project

## Future Technical Improvements

1. **Whiteboard:** HTML5 Canvas with drawing tools
2. **Voice Interface:** Web Speech API for TTS/STT
3. **Real-time Sync:** Firestore listeners for multi-device sync (optional)
4. **Image Optimization:** Compress images before upload
5. **Caching:** Cache AI responses for common problems (optional)

