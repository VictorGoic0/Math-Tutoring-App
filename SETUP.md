# Setup Guide - AI Math Tutor

Complete step-by-step instructions to set up and run the AI Math Tutor application from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Setup](#repository-setup)
3. [Firebase Setup](#firebase-setup)
4. [OpenAI API Key Setup](#openai-api-key-setup)
5. [Environment Variables](#environment-variables)
6. [Installation](#installation)
7. [Running the Application](#running-the-application)
8. [Verification](#verification)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- **Git** for cloning the repository
- **Firebase account** ([Sign up](https://firebase.google.com/) - free tier works)
- **OpenAI account** with API access ([Sign up](https://platform.openai.com/))

## Repository Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Math-Tutoring-App
```

### 2. Verify Project Structure

You should see:
```
Math-Tutoring-App/
├── frontend/
├── api/
├── architecture.mermaid
├── README.md
└── SETUP.md
```

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name (e.g., "math-tutoring-app")
4. **Disable Google Analytics** (optional for MVP)
5. Click **"Create project"**
6. Wait for project creation to complete

### Step 2: Enable Authentication

1. In Firebase Console, go to **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"** provider
5. Toggle **"Enable"** switch
6. Click **"Save"**

### Step 3: Enable Firestore Database

1. Go to **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll add security rules later)
4. Choose a location (pick closest to your users)
5. Click **"Enable"**

### Step 4: Enable Firebase Storage

1. Go to **"Build"** → **"Storage"**
2. Click **"Get started"**
3. Start in **test mode** (we'll add security rules later)
4. Use same location as Firestore
5. Click **"Done"**

### Step 5: Get Frontend Configuration

1. Go to **Project Settings** (gear icon) → **"General"** tab
2. Scroll to **"Your apps"** section
3. Click **Web icon** (`</>`) to add a web app
4. Register app with nickname: **"math-tutor-frontend"**
5. **Copy the `firebaseConfig` object** (you'll need this for frontend `.env`)

   It looks like:
   ```javascript
   {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   }
   ```

### Step 6: Create Service Account (Backend)

1. Go to **Project Settings** → **"Service accounts"** tab
2. Click **"Generate new private key"**
3. **Download the JSON file** (keep this secure!)
4. Open the JSON file and extract these values:
   - `project_id` → Will be used as `FIREBASE_PROJECT_ID`
   - `private_key` → Will be used as `FIREBASE_PRIVATE_KEY` (keep quotes and `\n`)
   - `client_email` → Will be used as `FIREBASE_CLIENT_EMAIL`

**Important:** The `private_key` in the JSON has `\n` characters that need to be preserved. When copying to `.env`, keep the quotes and ensure newlines are preserved.

## OpenAI API Key Setup

### Step 1: Create OpenAI Account

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Complete account verification

### Step 2: Get API Key

1. Navigate to **"API Keys"** section
2. Click **"Create new secret key"**
3. Give it a name (e.g., "Math Tutor App")
4. **Copy the key immediately** (you won't see it again!)
5. Store it securely

### Step 3: Verify Access

- Ensure your account has access to **GPT-4** models
- Check your **usage limits** and **billing** settings
- Note: GPT-4 usage is billed per token

## Environment Variables

### Frontend Environment Variables

Create `frontend/.env` file:

```env
# Firebase Configuration (from Step 5)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Backend API URL
VITE_API_URL=http://localhost:3000
```

**Important:** All frontend env variables must start with `VITE_` prefix for Vite to expose them.

### Backend Environment Variables

Create `api/.env` file:

```env
# OpenAI API Key
OPENAI_API_KEY=sk-...

# Firebase Admin SDK (from Step 6)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Critical Notes:**
- `FIREBASE_PRIVATE_KEY` must be in **quotes** and include `\n` characters
- The private key should be on a single line with `\n` representing newlines
- Copy the entire key from the JSON file, including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

**Complete Example Files:**

**frontend/.env:**
```env
# Firebase Configuration
# Get these from Firebase Console -> Project Settings -> General -> Your apps -> Web app config
VITE_FIREBASE_API_KEY=AIzaSyCexample123456789
VITE_FIREBASE_AUTH_DOMAIN=math-tutor-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=math-tutor-app
VITE_FIREBASE_STORAGE_BUCKET=math-tutor-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Backend API URL
# For local development: http://localhost:3000
# For production: https://your-app.vercel.app
VITE_API_URL=http://localhost:3000
```

**api/.env:**
```env
# OpenAI API Key
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-example123456789abcdefghijklmnopqrstuvwxyz

# Firebase Admin SDK
# Get from Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
FIREBASE_PROJECT_ID=math-tutor-app
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@math-tutor-app.iam.gserviceaccount.com

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## Installation

### Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will install:
- React 19.2.0
- Vite 7.1.12
- Firebase 11.1.0
- KaTeX and react-katex
- react-router-dom

### Install Backend Dependencies

```bash
cd ../api
npm install
```

This will install:
- Express 4.21.2
- AI SDK 5.0.76 (Vercel AI SDK)
- @ai-sdk/openai
- firebase-admin 13.5.0
- cors, dotenv

## Running the Application

### Development Mode

You need **two terminal windows** running simultaneously:

#### Terminal 1: Backend Server

```bash
cd api
npm run dev
```

You should see:
```
Server running on port 3000
```

Backend will run on `http://localhost:3000`

#### Terminal 2: Frontend Development Server

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Frontend will run on `http://localhost:5173`

### Access the Application

1. Open your browser
2. Navigate to `http://localhost:5173`
3. You should see the login page
4. Sign up for a new account
5. Start chatting with the AI tutor!

## Verification

### Test 1: Backend Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{"status":"ok","message":"Backend is running"}
```

### Test 2: Frontend Connection

1. Open browser console (F12)
2. Navigate to `http://localhost:5173`
3. Check for any connection errors
4. Verify Firebase initialization messages

### Test 3: Authentication

1. Click "Sign Up"
2. Enter email and password
3. Verify account creation
4. Check Firebase Console → Authentication → Users (should see your user)

### Test 4: Chat Functionality

1. Type a math problem: "Solve 2x + 5 = 13"
2. Send the message
3. Verify:
   - Message appears immediately
   - AI response streams in
   - Math equations render correctly
   - Message persists after refresh

### Test 5: Image Upload

1. Click camera icon (📷)
2. Select an image (PNG or JPG, max 10MB)
3. Verify preview appears
4. Send message
5. Verify image displays in chat

## Deployment

### Prerequisites

- Vercel account ([Sign up](https://vercel.com/) - free tier works)
- Vercel CLI installed: `npm i -g vercel`

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Configure Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or create new)
3. Go to **Settings** → **Environment Variables**
4. Add all environment variables:

**For Frontend (prefix with `VITE_`):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_API_URL` (set to your production API URL)

**For Backend (no prefix):**
- `OPENAI_API_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY` (with quotes and `\n`)
- `FIREBASE_CLIENT_EMAIL`
- `PORT` (optional, Vercel sets this)
- `FRONTEND_URL` (set to your production frontend URL)

### Step 4: Deploy

```bash
# From project root
vercel
```

Follow prompts:
- Set up and deploy? **Yes**
- Which scope? (select your account)
- Link to existing project? **No** (or **Yes** if updating)
- What's your project's name? (enter name)
- In which directory is your code located? **./**
- Want to override settings? **No**

### Step 5: Update Environment Variables

After first deployment:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `VITE_API_URL` to your production API URL
3. Update `FRONTEND_URL` to your production frontend URL
4. Redeploy if needed

### Step 6: Configure Firebase for Production

1. Go to Firebase Console → Authentication → Settings
2. Add your production domain to **Authorized domains**
3. Go to Firebase Console → Storage → Rules
4. Update security rules for production (see `firestore.rules`)

### Step 7: Verify Production Deployment

1. Visit your Vercel deployment URL
2. Test authentication
3. Test chat functionality
4. Test image upload
5. Check browser console for errors

## Troubleshooting

### Backend Issues

**Problem: Backend won't start**
- ✅ Check `PORT` is available (no other service on 3000)
- ✅ Verify all env variables are set in `api/.env`
- ✅ Check `FIREBASE_PRIVATE_KEY` has quotes and `\n` characters
- ✅ Verify Node.js version is 18+

**Problem: "Cannot find module" errors**
- ✅ Run `npm install` in `api/` directory
- ✅ Check `package.json` has all dependencies
- ✅ Delete `node_modules` and `package-lock.json`, then `npm install`

**Problem: OpenAI API errors**
- ✅ Verify `OPENAI_API_KEY` is correct
- ✅ Check API key has GPT-4 access
- ✅ Verify account has sufficient credits
- ✅ Check OpenAI status page for outages

### Frontend Issues

**Problem: Frontend won't start**
- ✅ Check `VITE_API_URL` is set correctly
- ✅ Verify all Firebase env variables start with `VITE_`
- ✅ Run `npm install` in `frontend/` directory
- ✅ Check Node.js version is 18+

**Problem: Firebase connection fails**
- ✅ Verify all Firebase env variables are correct
- ✅ Check Firebase project has Auth, Firestore, and Storage enabled
- ✅ Verify Firebase project is active (not deleted)
- ✅ Check browser console for specific Firebase errors

**Problem: Math equations not rendering**
- ✅ Check browser console for KaTeX errors
- ✅ Verify `katex` and `react-katex` are installed
- ✅ Check LaTeX syntax (use `$...$` format)

**Problem: Images not uploading**
- ✅ Verify Firebase Storage is enabled
- ✅ Check image size (max 10MB)
- ✅ Verify file type (PNG, JPG supported)
- ✅ Check Firebase Storage CORS configuration
- ✅ Verify `VITE_FIREBASE_STORAGE_BUCKET` is correct

### Deployment Issues

**Problem: Build fails on Vercel**
- ✅ Check build logs in Vercel Dashboard
- ✅ Verify all environment variables are set
- ✅ Check `package.json` scripts are correct
- ✅ Verify Node.js version in Vercel settings

**Problem: API routes not working**
- ✅ Verify `vercel.json` is configured correctly
- ✅ Check Express routes are in `api/` directory
- ✅ Verify environment variables are set for production
- ✅ Check Vercel function logs for errors

**Problem: CORS errors in production**
- ✅ Update `FRONTEND_URL` in backend env variables
- ✅ Check CORS settings in `api/server.js`
- ✅ Verify frontend URL matches production domain

### Common Environment Variable Issues

**Problem: "process.env.VARIABLE is undefined"**
- ✅ Frontend: Ensure variable starts with `VITE_` prefix
- ✅ Backend: Ensure variable is in `api/.env` file
- ✅ Restart dev server after changing `.env` files
- ✅ Vercel: Ensure variable is set in dashboard

**Problem: Firebase private key format errors**
- ✅ Ensure key is wrapped in quotes: `"-----BEGIN...-----"`
- ✅ Preserve `\n` characters (don't replace with actual newlines)
- ✅ Copy entire key including `-----BEGIN` and `-----END` lines
- ✅ Example format:
  ```env
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
  ```

### Getting Help

If you're still stuck:

1. **Check the logs:**
   - Backend: Terminal output from `npm run dev`
   - Frontend: Browser console (F12)
   - Vercel: Dashboard → Deployments → Function Logs

2. **Verify environment:**
   - All `.env` files are in correct directories
   - All variables are set correctly
   - No typos in variable names

3. **Check documentation:**
   - [README.md](README.md) - Project overview
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
   - [PRD.md](PRD.md) - Product requirements

4. **Common solutions:**
   - Delete `node_modules` and `package-lock.json`, reinstall
   - Clear browser cache and hard refresh
   - Restart both frontend and backend servers
   - Check Firebase and OpenAI service status

---

**Next Steps:**
- Review [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system design
- Check [tasks.md](tasks.md) for development roadmap
- Read [PRD.md](PRD.md) for product requirements

