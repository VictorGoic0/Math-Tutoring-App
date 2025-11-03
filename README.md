# AI Math Tutor - Socratic Learning Assistant

An AI-powered math tutoring application that guides students through problem-solving using Socratic questioning methodology. Students can input problems via text or image upload, and the tutor helps them discover solutions through guided dialogue without providing direct answers.

## 🎯 Overview

This application combines:
- **Conversational AI** using OpenAI GPT-4 with Vision
- **Interactive Whiteboard** for step-by-step visualizations
- **Real-time Persistence** via Firebase Firestore
- **Voice Interface** (optional) for hands-free learning

## 🏗️ Architecture

- **Frontend:** React 18+ with Vite
- **Backend:** Express.js (deployed to Vercel as serverless functions)
- **Database:** Firebase Firestore
- **AI:** OpenAI GPT-4 Vision via Vercel AI SDK

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- Firebase account
- OpenAI API key

## 🚀 Quick Start

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
cd ../backend
npm install
```

### 3. Set Up Environment Variables

**Frontend (.env in frontend/):**
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:3000
```

**Backend (.env in backend/):**
```env
OPENAI_API_KEY=your_openai_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
PORT=3000
FRONTEND_URL=http://localhost:5173
```

See `.env.example` files for reference.

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Enable Firestore Database
4. Get your Firebase config (Project Settings > General > Your apps)
5. For backend, create a Service Account (Project Settings > Service Accounts > Generate new private key)

### 5. OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys
3. Create a new secret key
4. Add to backend `.env` as `OPENAI_API_KEY`

### 6. Run Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### 7. Test Connection

Visit `http://localhost:5173` - you should see "Backend: ✅ Connected"

## 📁 Project Structure

```
Math-Tutoring-App/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── routes/            # Express routes
│   ├── services/          # Business logic
│   ├── server.js          # Express server
│   └── package.json
├── api/
│   └── index.js           # Vercel serverless wrapper
├── vercel.json            # Vercel configuration
├── .env.example           # Environment variables template
└── README.md
```

## 🚢 Deployment to Vercel

### Prerequisites
- Vercel account (free tier works)
- Vercel CLI installed: `npm i -g vercel`

### Deploy Steps

1. **Login to Vercel:**
```bash
vercel login
```

2. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project settings
   - Add all environment variables from `.env.example`
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
Open browser console at `http://localhost:5173` and check for connection status.

## 📚 Key Features

- ✅ **Text Input:** Type math problems directly
- ✅ **Image Upload:** Upload images of problems (printed text)
- ✅ **Socratic Dialogue:** AI guides through questions, never gives direct answers
- ✅ **Step Visualization:** Whiteboard renders each solution step
- ✅ **Interactive Drawing:** Students can annotate on whiteboard
- ✅ **Real-time Persistence:** Conversations saved to Firestore
- ⏳ **Voice Interface:** TTS/STT (coming in P2)

## 🔧 Development

### Adding New API Routes

1. Create route file in `backend/routes/`
2. Import and use in `backend/server.js`
3. Route automatically available at `/api/[route-name]`

### Frontend-Backend Communication

Frontend uses the `VITE_API_URL` environment variable to connect to the backend. Set this to:
- `http://localhost:3000` for local development
- Your production backend URL after deployment

All API calls use the full URL from this environment variable.

## 🐛 Troubleshooting

### Backend not connecting
- Check backend is running on port 3000
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check CORS settings in `backend/server.js`

### Firebase connection fails
- Verify all Firebase env variables are set correctly
- Check Firebase project has Firestore enabled
- Ensure service account key is properly formatted (with quotes and newlines)

### OpenAI API errors
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits
- Review OpenAI API rate limits

## 📝 License

ISC

## 👥 Credits

Built as part of The Gauntlet challenge.

---

**Note:** This is an MVP. See `PRD.md` for full requirements and `tasks.md` for development roadmap.

