# Technical Context

## Technology Stack

### Frontend
- **Framework:** React 18+ with Vite
- **Math Rendering:** KaTeX for chat UI
- **Canvas:** HTML5 Canvas API for whiteboard
- **Voice:** Web Speech API (TTS/STT) - P2
- **AI Integration:** Vercel AI SDK (`useChat` hook)
- **Styling:** CSS (approach TBD - could be styled-components, Tailwind, or plain CSS)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **AI Integration:** Vercel AI SDK for OpenAI integration
- **AI Model:** OpenAI GPT-4 with Vision (via Vercel AI SDK)
- **Database:** Firebase Firestore
- **File Storage:** TBD (base64 encoding or temporary storage for images)

### Infrastructure
- **Frontend Deployment:** Vercel
- **Backend Deployment:** Vercel (serverless functions)
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

### Frontend (Planned)
- `react`, `react-dom`
- `vite`, `@vitejs/plugin-react`
- `ai` (Vercel AI SDK)
- `firebase`
- `katex`, `react-katex` (for math rendering)
- Additional TBD

### Backend (Planned)
- `express`
- `ai` (Vercel AI SDK)
- `openai`
- `firebase-admin`
- `cors`
- `dotenv`
- Additional TBD

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
   - Frontend: Vercel deployment
   - Backend: Vercel serverless functions
   - Environment variables configured in Vercel dashboard

## Key Technical Decisions

1. **Vercel AI SDK:** Saves 4-6 hours on chat UI implementation
2. **Firestore:** Provides real-time updates + persistence with minimal setup
3. **JavaScript Ecosystem:** Stay in JS for faster development
4. **OpenAI Vision:** Handles image parsing (no separate OCR needed)
5. **Canvas API:** Native HTML5 for whiteboard (no external libraries)
6. **Web Speech API:** Browser native for MVP speed (can upgrade later)

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

