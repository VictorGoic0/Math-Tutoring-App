# Technical Context

## Technology Stack

### Frontend
- **Framework:** React 18+ with Vite
- **Math Rendering:** KaTeX for chat UI
- **Canvas:** HTML5 Canvas API for whiteboard
- **Voice:** Web Speech API (TTS/STT) - P2
- **AI Integration:** ~~Vercel AI SDK removed from frontend~~ - Manual state management with `fetch` + custom stream parser
  - Previously used `useChat` hook, removed in PR #7 for simplification
  - Frontend now handles: messages state, input state, loading state, manual streaming
  - Stream parsing: Plain text chunks via `ReadableStream` API
  - No AI SDK dependencies on frontend
- **Styling:** Inline styles (TBD: Will migrate to SASS/CSS Modules in PR #16)

### Backend
- **Runtime:** Node.js (CommonJS modules)
- **Framework:** Express.js
- **AI Integration:** Vercel AI SDK v5 for OpenAI integration (API key server-side only)
  - **Backend imports:** `const { streamText } = require('ai')` and `const { createOpenAI } = require('@ai-sdk/openai')`
  - Uses `streamText` for streaming responses (synchronous in v5, returns StreamTextResult)
  - Uses `pipeTextStreamToResponse(res)` to pipe plain text stream to Express response
  - OpenAI provider initialization via `createOpenAI({ apiKey })`
- **AI Models:** 
  - `gpt-4-turbo` for text-only conversations
  - `gpt-4o` for conversations with images (native vision support)
- **Database:** Firebase Firestore (client writes from frontend, backend read-only)
- **File Storage:** Firebase Storage (images uploaded from frontend)

### Infrastructure
- **Frontend Deployment:** Vercel (separate project)
  - Root Directory: `/frontend`
  - Framework Preset: `Vite`
  - SPA routing: `frontend/vercel.json` rewrites all routes to `/index.html`
- **Backend Deployment:** Vercel (separate project, Express as serverless functions)
  - Root Directory: `/api`
  - Framework Preset: `Other` (Node.js)
  - Entry Point: `api/index.js` (exports Express app)
  - Configuration: `api/vercel.json` explicitly configures `@vercel/node` runtime
  - **Important:** When Root Directory is `/api`, Vercel strips `/api` prefix from routes
  - Express routes must be at root level (e.g., `/health` not `/api/health`)
  - CORS enabled in production (separate projects = different origins)
- **Database:** Firebase (managed)
- **Real-time:** Firestore real-time listeners (no WebSockets needed)

## Development Setup

### Prerequisites
- Node.js (version TBD - check package.json)
- npm or yarn
- Firebase account
- OpenAI API key

### Environment Variables

**Frontend (.env):**
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=http://localhost:3000
```

**Backend (.env):**
```
OPENAI_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
PORT=3000
```

### Installation Commands

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
npm install
npm run dev
```

## Dependencies

### Frontend (Installed)
- `react`, `react-dom` (v19.2.0)
- `vite`, `@vitejs/plugin-react` (v7.1.12, v5.1.0)
- ~~`ai` - Removed in PR #7~~ - No longer using Vercel AI SDK on frontend
- `firebase` (v11.1.0) - Auth, Firestore, Storage
- `katex`, `react-katex` (v0.16.11, v3.0.1) - for math rendering
- `react-router-dom` (v7.9.5) - for routing

### Backend (Installed)
- `express` (v4.21.2)
- `ai` (v5.0.76) - Vercel AI SDK (upgraded from v3.4.33)
  - Provides `streamText` function for streaming AI responses
  - Key change in v5: `streamText` is synchronous, returns StreamTextResult directly
- `@ai-sdk/openai` (latest) - OpenAI provider for Vercel AI SDK
- `firebase-admin` (v13.5.0)
- `cors` (v2.8.5)
- `dotenv` (v16.4.7)

## Technical Constraints

1. **API Rate Limits:** OpenAI API has rate limits - implement caching if needed
2. **Cost Management:** Monitor OpenAI API usage, set up cost alerts
3. **Canvas Performance:** Complex visualizations may need optimization
4. **Browser Compatibility:** Web Speech API varies by browser
5. **Image Size:** Max 10MB per image upload
6. **Firestore Limits:** Real-time listeners have connection limits

## Development Workflow

1. **Local Development:**
   - Frontend runs on `localhost:5173` (Vite default)
   - Backend runs on `localhost:3000`
   - Frontend calls: `http://localhost:3000/api/chat` (with `/api` prefix locally)
   - Firebase emulator (optional) for local testing

2. **Testing:**
   - Manual testing with 5+ problem types
   - Browser compatibility testing
   - Responsive design testing

3. **Deployment:**
   - **Frontend:** Separate Vercel project
    - Root Directory: `/frontend`
    - Framework: Vite (auto-detected)
    - Build: `npm run build` → `frontend/dist`
    - Environment Variables: All `VITE_*` prefixed
    - API URL: Set `VITE_API_URL` to backend deployment URL
    - Routes: `frontend/vercel.json` handles React Router SPA routing
  - **Backend:** Separate Vercel project
    - Root Directory: `/api`
    - Framework: Other (Node.js)
    - Entry Point: `api/index.js` (wraps Express app)
    - Configuration: `api/vercel.json` for explicit serverless function config
    - Environment Variables: Server-only (no `VITE_` prefix)
    - CORS: Enabled with `FRONTEND_URL` environment variable
    - Routes: No `/api` prefix in Express (Vercel strips it when Root Directory is `/api`)
    - Frontend calls: `https://backend-url.vercel.app/chat` (no `/api` prefix)

## Firebase Admin SDK Initialization

**Lazy Initialization Pattern (Vercel Serverless):**
- Firebase Admin SDK initializes on first access, not at module load
- Fixes Vercel serverless cold start timing issues
- Environment variables may not be available when module loads
- Exports getter functions: `getAdmin()`, `getAuth()`, `getDb()`
- All Firebase operations use lazy getters to ensure env vars are available

**Implementation:**
- `api/utils/firebaseAdmin.js` - Lazy initialization with getter functions
- `api/middleware/auth.js` - Uses `getAuth()` inside middleware function
- `api/services/firestoreService.js` - Uses `getDb()` via wrapper function `db()`

## Key Technical Decisions

1. **Express + Vercel:** Express provides professional, standard backend architecture for hiring manager demo. Vercel auto-wraps Express as serverless functions, giving best of both worlds: clean structure + serverless benefits (no cold starts during demos, auto-scaling)
2. **Manual State Management (Frontend):** Removed `useChat` hook in PR #7 for simplicity. Direct control over messages, input, loading states with optimistic updates.
3. **Vercel AI SDK v5 (Backend):** Upgraded from v3 to v5 for cleaner API and better model support
   - `streamText` is synchronous in v5 (no await needed)
   - `pipeTextStreamToResponse(res)` for Express (plain text streaming)
   - `gpt-4o` for vision instead of deprecated `gpt-4-vision-preview`
4. **Plain Text Streaming:** Simpler than data stream format - frontend just reads text chunks
5. **Firestore Direct Writes:** Frontend writes directly to Firestore (optimistic UI), backend read-only
6. **JavaScript Ecosystem:** Stay in JS for faster development (CommonJS on backend for dotenv)
7. **OpenAI Vision:** `gpt-4o` handles image parsing natively (no separate OCR needed)
8. **Canvas API:** Native HTML5 for whiteboard (no external libraries)
9. **Web Speech API:** Browser native for MVP speed (can upgrade later)

## Known Technical Challenges

1. **LaTeX-to-Canvas Rendering:** Need to render math equations on canvas (not just DOM)
2. **Canvas State Serialization:** Save/load drawings efficiently
3. **Real-time Canvas Sync:** Keep canvas state in sync across updates
4. **Voice Browser Support:** Web Speech API varies by browser
5. **Image Processing:** Handle multiple image formats (PNG, JPG, HEIC)

## Future Technical Enhancements

- Higher-quality TTS/STT APIs (ElevenLabs, Deepgram)
- Canvas optimization (requestAnimationFrame, layer caching)
- Image optimization (compression, resizing)
- PWA support for mobile
- Service worker for offline support

