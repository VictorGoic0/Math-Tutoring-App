# Technical Context

## Technology Stack

### Frontend
- **Framework:** React 18+ with Vite
- **Math Rendering:** KaTeX for chat UI
- **Canvas:** HTML5 Canvas API for whiteboard
- **Voice:** Web Speech API (TTS/STT) - P2
- **AI Integration:** Vercel AI SDK (`useChat` hook for chat UI state management and streaming - configured to call our Express `/api/chat` endpoint, never OpenAI directly)
  - **CORRECT IMPORT:** `import { useChat } from '@ai-sdk/react'` (NOT `'ai/react'`)
  - This is the verified correct import path for the `ai` v5+ package
  - The `@ai-sdk/react` export provides React-specific hooks including `useChat`
- **Styling:** CSS (approach TBD - could be styled-components, Tailwind, or plain CSS)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **AI Integration:** Vercel AI SDK for OpenAI integration (API key server-side only)
  - **Backend imports:** `import { streamText } from 'ai'` and `import { createOpenAI } from '@ai-sdk/openai'`
  - Uses `streamText` for streaming responses and `createOpenAI` for OpenAI provider initialization
- **AI Model:** OpenAI GPT-4 with Vision (via Vercel AI SDK)
- **Database:** Firebase Firestore
- **File Storage:** TBD (base64 encoding or temporary storage for images)

### Infrastructure
- **Frontend Deployment:** Vercel
- **Backend Deployment:** Vercel (Express app auto-wrapped as serverless functions)
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
- `ai` (v5.0.86) - Vercel AI SDK
  - Provides `@ai-sdk/react` export with `useChat` hook
- `firebase` (v11.1.0)
- `katex`, `react-katex` (v0.16.11, v3.0.1) - for math rendering
- `react-router-dom` (v7.9.5) - for routing

### Backend (Installed)
- `express` (v4.21.2)
- `ai` (v5.0.86) - Vercel AI SDK (provides `streamText` function)
- `@ai-sdk/openai` (v1.0.0) - OpenAI provider for Vercel AI SDK
- `openai` (v6.7.0) - OpenAI SDK (legacy, kept for compatibility)
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
   - Firebase emulator (optional) for local testing

2. **Testing:**
   - Manual testing with 5+ problem types
   - Browser compatibility testing
   - Responsive design testing

3. **Deployment:**
   - Frontend: Vercel deployment (standard static site)
   - Backend: Express app deployed to Vercel (auto-wrapped as serverless functions via vercel.json)
   - Environment variables configured in Vercel dashboard
   - Vercel automatically converts Express routes to serverless functions

## Key Technical Decisions

1. **Express + Vercel:** Express provides professional, standard backend architecture for hiring manager demo. Vercel auto-wraps Express as serverless functions, giving best of both worlds: clean structure + serverless benefits (no cold starts during demos, auto-scaling)
2. **Vercel AI SDK:** Saves 4-6 hours on chat UI implementation
3. **Firestore:** Provides real-time updates + persistence with minimal setup
4. **JavaScript Ecosystem:** Stay in JS for faster development
5. **OpenAI Vision:** Handles image parsing (no separate OCR needed)
6. **Canvas API:** Native HTML5 for whiteboard (no external libraries)
7. **Web Speech API:** Browser native for MVP speed (can upgrade later)

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

