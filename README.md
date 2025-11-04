# AI Math Tutor - Socratic Learning Assistant

An AI-powered math tutoring application that guides students through problem-solving using Socratic questioning methodology. Students can input problems via text or image upload, and the tutor helps them discover solutions through guided dialogue without providing direct answers.

## 🎯 Overview

This application combines:
- **Conversational AI** using OpenAI GPT-4 with Vision
- **Math Rendering** with KaTeX for beautiful LaTeX equations
- **Markdown Formatting** for rich text responses (bold, italic, code)
- **Real-time Persistence** via Firebase Firestore
- **Image Upload** via Firebase Storage for problem parsing

## 🏗️ Architecture

- **Frontend:** React 19+ with Vite
- **Backend:** Express.js (deployed to Vercel as serverless functions)
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage (for images)
- **AI:** OpenAI GPT-4 Vision via Vercel AI SDK v5 (all calls through Express backend)

**Security:** OpenAI API key is stored server-side only. Frontend never directly communicates with OpenAI - all requests go through our Express API.

For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md).

## 📋 Prerequisites

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Firebase account** (free tier works)
- **OpenAI API key** with GPT-4 access

## 🚀 Quick Start

For detailed setup instructions, see [SETUP.md](SETUP.md).

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Math-Tutoring-App
```

### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd ../api
npm install
```

### 3. Set Up Environment Variables

Create `.env` files in both `frontend/` and `api/` directories with the following variables:

**Frontend (frontend/.env):**
```env
# Firebase Configuration
# Get these from Firebase Console -> Project Settings -> General -> Your apps -> Web app
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Backend API URL
VITE_API_URL=http://localhost:3000
```

**Backend (api/.env):**
```env
# OpenAI API Key
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key

# Firebase Admin SDK
# Get from Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key with \n newlines preserved\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 4. Run Locally

**Terminal 1 - Backend:**
```bash
cd api
npm run dev
```
Backend runs on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### 5. Access the Application

Visit `http://localhost:5173` in your browser. You'll need to:
1. Sign up for a new account (or log in)
2. Start chatting with the AI tutor!

## 📁 Project Structure

```
Math-Tutoring-App/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components (Chat, MessageList, etc.)
│   │   ├── contexts/         # React contexts (AuthContext)
│   │   ├── hooks/            # Custom React hooks (useAuth)
│   │   ├── services/         # API and service utilities
│   │   ├── utils/            # Utility functions (firebase, markdownParser)
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   └── vite.config.js
├── api/                      # Express backend
│   ├── routes/               # API routes (chat.js)
│   ├── services/            # Business logic (promptService, contextManager)
│   ├── middleware/           # Express middleware (auth.js)
│   ├── utils/                # Backend utilities (firebaseAdmin)
│   ├── server.js             # Express server
│   ├── index.js              # Vercel serverless wrapper
│   └── package.json
├── memory-bank/              # Project context and progress docs
├── SETUP.md                  # Detailed setup instructions
├── ARCHITECTURE.md            # Architecture documentation
├── architecture.mermaid      # Architecture diagram (Mermaid)
├── vercel.json               # Vercel deployment configuration
├── firestore.rules           # Firestore security rules
└── README.md
```

## 📚 Key Features

### ✅ Implemented Features

- **Text Input:** Type math problems directly
- **Image Upload:** Upload images of problems (printed text, max 10MB)
- **Socratic Dialogue:** AI guides through questions, never gives direct answers
- **Math Rendering:** Beautiful LaTeX equation rendering with KaTeX
- **Markdown Formatting:** Support for bold, italic, and code formatting
- **Real-time Persistence:** Conversations saved to Firestore
- **Optimistic UI:** Instant message display with background persistence
- **Streaming Responses:** Real-time AI response streaming
- **Context Awareness:** AI adapts to student understanding level

### ⏳ Future Features

- **Interactive Whiteboard:** Step-by-step visualizations (planned)
- **Voice Interface:** TTS/STT for hands-free learning (planned)

## 🧪 Testing

### Test Backend Connection

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{"status":"ok","message":"Backend is running"}
```

### Test Frontend-Backend Communication

1. Open browser console at `http://localhost:5173`
2. Check for connection status messages
3. Try sending a message to verify streaming works

### Test Image Upload

1. Click the camera icon in the message input
2. Select an image (PNG, JPG, max 10MB)
3. Verify image preview appears
4. Send message and verify image displays in chat

## 🚢 Deployment to Vercel

### Prerequisites

- Vercel account (free tier works)
- Vercel CLI installed: `npm i -g vercel`

### Quick Deploy Steps

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project settings → Environment Variables
   - Add all environment variables from `.env.example` files
   - For frontend variables, prefix with `VITE_`
   - For backend, add without prefix

3. **Deploy:**
   ```bash
   vercel
   ```

   Or push to your connected Git repository for automatic deployments.

### Vercel Configuration

The `vercel.json` file configures:
- Frontend static build from `frontend/dist`
- Backend Express routes via `/api/*` paths
- Express app auto-wrapped as serverless functions

For detailed deployment instructions, see [docs/SETUP.md](docs/SETUP.md#deployment).

## 🔧 Development

### Adding New API Routes

1. Create route file in `api/routes/`
2. Import and use in `api/server.js`:
   ```javascript
   const newRoute = require('./routes/newRoute');
   app.use('/api/new', newRoute);
   ```
3. Route automatically available at `/api/new`

### Frontend-Backend Communication

Frontend uses the `VITE_API_URL` environment variable to connect to the backend. Set this to:
- `http://localhost:3000` for local development
- Your production backend URL after deployment

All API calls use the full URL from this environment variable.

### Code Style

- **Frontend:** React functional components with hooks
- **Backend:** Express routes with CommonJS modules
- **State Management:** React Context API for auth, local state for messages
- **Styling:** Inline styles (to be migrated to SASS in PR #16)

## 🐛 Troubleshooting

### Common Issues

**Backend not connecting:**
- Check backend is running on port 3000
- Verify `FRONTEND_URL` in api `.env` matches frontend URL
- Check CORS settings in `api/server.js`

**Firebase connection fails:**
- Verify all Firebase env variables are set correctly
- Check Firebase project has Firestore and Storage enabled
- Ensure service account key is properly formatted (with quotes and `\n` newlines)

**OpenAI API errors:**
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits and GPT-4 access
- Review OpenAI API rate limits

**Image upload fails:**
- Verify Firebase Storage is enabled
- Check image size (max 10MB)
- Verify CORS is configured for Firebase Storage

**Math rendering not working:**
- Check browser console for KaTeX errors
- Verify LaTeX syntax is correct (use `$...$` format)

For more detailed troubleshooting, see [SETUP.md](SETUP.md#troubleshooting).

## 📖 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup and configuration instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[PRD.md](PRD.md)** - Product Requirements Document
- **[tasks.md](tasks.md)** - Development roadmap and PR breakdown

## 🛠️ Tech Stack

- **Frontend:**
  - React 19.2.0
  - Vite 7.1.12
  - Firebase 11.1.0 (Auth, Firestore, Storage)
  - KaTeX 0.16.11 + react-katex 3.0.1 (math rendering)
  - react-router-dom 7.9.5

- **Backend:**
  - Express 4.21.2
  - AI SDK 5.0.76 (Vercel AI SDK)
  - @ai-sdk/openai 2.0.53
  - firebase-admin 13.5.0
  - OpenAI API 4.67.3

## 📝 License

ISC

## 👥 Credits

Built as part of The Gauntlet challenge.

---

**Note:** This is an MVP. See `PRD.md` for full requirements and `tasks.md` for development roadmap.
