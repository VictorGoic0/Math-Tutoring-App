# Project Brief: AI Math Tutor - Socratic Learning Assistant

**Version:** 1.0  
**Date:** November 3, 2025  
**Timeline:** 3-5 days MVP  
**Status:** Partially Complete (Core chat features done, whiteboard/voice pending)

## Project Overview

Build an AI-powered math tutoring application that guides students through problem-solving using Socratic questioning methodology. Students can input problems via text or image upload, and the tutor helps them discover solutions through guided dialogue without providing direct answers.

**Inspiration:** [OpenAI x Khan Academy Demo](https://www.youtube.com/watch?v=IvXZCocyU_M)

## Core Objectives

1. **Pedagogical Excellence:** Never provide direct answers - guide students to discovery through questions
2. **Multi-Modal Input:** Support text and image uploads (printed problems prioritized for MVP)
3. **Visual Learning:** Interactive whiteboard with step-by-step visualizations (planned)
4. **Conversational AI:** Maintain context across multi-turn dialogues with adaptive scaffolding
5. **Production Ready:** Deployed, documented, and ready for demo

## Success Criteria

**MVP Success Metrics:**
- ✅ Successfully guides students through 5+ different problem types without giving direct answers
- ✅ Maintains conversation context across multi-turn dialogues
- ✅ Adapts questioning based on student understanding level
- ⏳ Interactive whiteboard supports collaborative drawing (not yet implemented)
- ⏳ Step visualizations render clearly on canvas (not yet implemented)
- ⏳ Voice interface (TTS and STT) works with reasonable accuracy (not yet implemented)

## Current Status

**Completed (P0 Core):**
- ✅ Project setup and infrastructure
- ✅ Firebase Authentication (Email/Password)
- ✅ Basic chat UI with manual state management
- ✅ Socratic prompting system with adaptive scaffolding
- ✅ Firestore integration for conversation persistence
- ✅ Image upload UI with Firebase Storage
- ✅ OpenAI Vision integration for image parsing
- ✅ Math rendering with KaTeX (inline and block equations)
- ✅ Markdown parsing (bold, italic, code)
- ✅ UI polish with design system integration
- ✅ Deployment to Vercel (separate frontend/backend projects)

**In Progress / Pending:**
- ⏳ Whiteboard component foundation (PR #9)
- ⏳ Step visualization rendering on canvas (PR #10)
- ⏳ Drawing lock/unlock mechanism (PR #11)
- ⏳ Basic drawing tools (pen, eraser) (PR #12)
- ⏳ Canvas state management (PR #13)
- ⏳ Color picker & clear button (PR #14)
- ⏳ Voice interface (TTS + STT) (PR #21)

## Key Architecture Decisions

1. **Firebase Admin Removal:** Removed from backend due to Vercel serverless compatibility issues. All Firestore operations now handled directly by frontend.
2. **Manual State Management:** Removed `useChat` hook from Vercel AI SDK for full control and simplification.
3. **Single Conversation Per User:** Simplified MVP approach - each user has one ongoing conversation.
4. **Optimistic UI:** Messages appear instantly, Firebase saves happen in background.
5. **Backend as Pure Proxy:** Backend is now a clean OpenAI API proxy with no database operations.

## Technology Stack

- **Frontend:** React 19+ with Vite, KaTeX, Design System components
- **Backend:** Express.js deployed as Vercel serverless functions
- **AI:** OpenAI GPT-4 Vision (gpt-4o) and GPT-4 Turbo via Vercel AI SDK v5
- **Database:** Firebase Firestore (frontend direct writes)
- **Storage:** Firebase Storage (for images)
- **Deployment:** Vercel (separate projects for frontend and backend)

## Timeline

**Original Plan:** 3-5 days  
**Current Status:** Core chat features complete, whiteboard/voice features pending

**Completed Days:**
- Day 1: Foundation (setup, auth, basic chat)
- Day 2: Problem input & parsing (image upload, vision, persistence, math rendering)
- Day 4: UI polish & design system integration
- Day 5: Deployment to Vercel

**Remaining Work:**
- Day 3: Whiteboard & step visualization (PRs #9-14)
- Day 4: Voice interface (PR #21) - optional

## Deliverables

1. ✅ Deployed Application (frontend + backend on Vercel)
2. ✅ GitHub Repository with documentation
3. ✅ README.md, SETUP.md, ARCHITECTURE.md
4. ⏳ Demo Video (pending)
5. ⏳ EXAMPLES.md with 5+ problem walkthroughs (pending)

