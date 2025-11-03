# AI Math Tutor - MVP PR Breakdown

**Timeline:** 3-5 days  
**Date:** November 3, 2025

---

## Priority 0 (P0) - Core Foundation PRs

These PRs must be completed first. They form the essential foundation of the application.

---

### PR #1: Project Setup & Basic Infrastructure
**Priority:** P0  
**Estimated Time:** 2-3 hours  
**Day:** 1

**Tasks:**
- [ ] Initialize React + Vite project
- [ ] Set up project structure (components/, hooks/, utils/)
- [ ] Initialize Express backend
- [ ] Set up environment variables (.env files)
- [ ] Configure Firebase project and Firestore database
- [ ] Set up Vercel AI SDK dependencies
- [ ] Configure basic CORS and API routes
- [ ] Create basic README with setup instructions
- [ ] Test that frontend and backend can communicate

**Acceptance Criteria:**
- Frontend runs on localhost:5173 (or similar)
- Backend runs on localhost:3000 (or similar)
- Frontend can make API call to backend
- Firebase connection established
- All environment variables documented

**Files Created:**
```
frontend/
  ├── src/
  │   ├── App.jsx
  │   ├── main.jsx
  │   └── components/
  ├── package.json
  └── vite.config.js

backend/
  ├── server.js
  ├── routes/
  ├── services/
  └── package.json

.env.example
README.md
```

---

### PR #2: Basic Chat UI with Vercel AI SDK
**Priority:** P0  
**Estimated Time:** 3-4 hours  
**Day:** 1

**Tasks:**
- [ ] Install Vercel AI SDK (`ai` package)
- [ ] Create Chat component with message history display
- [ ] Implement text input field
- [ ] Integrate `useChat()` hook from Vercel AI SDK
- [ ] Create `/api/chat` endpoint in Express
- [ ] Connect to OpenAI GPT-4 via Vercel AI SDK
- [ ] Display user and assistant messages in chat
- [ ] Test with hardcoded math problem

**Acceptance Criteria:**
- Chat UI renders messages correctly
- User can type and send messages
- AI responds to messages
- Conversation history displays properly
- Messages stream in real-time (Vercel AI SDK streaming)

**Files Created/Modified:**
```
frontend/src/components/Chat.jsx
frontend/src/components/MessageList.jsx
frontend/src/components/MessageInput.jsx
backend/routes/chat.js
```

---

### PR #3: Socratic Prompting System
**Priority:** P0  
**Estimated Time:** 2-3 hours  
**Day:** 1

**Tasks:**
- [ ] Create Socratic system prompt (follow PRD template)
- [ ] Implement prompt in `/api/chat` endpoint
- [ ] Add conversation context management
- [ ] Test with hardcoded math problem: "2x + 5 = 13"
- [ ] Verify AI never gives direct answers
- [ ] Test hint triggering after 2+ stuck turns
- [ ] Document prompt engineering notes

**Acceptance Criteria:**
- AI guides through questions, never gives direct answers
- Hints trigger appropriately when student is stuck
- Encouraging language is used consistently
- Test conversation completes successfully with hardcoded problem
- Prompt engineering notes documented

**Files Created/Modified:**
```
backend/services/promptService.js
backend/services/contextManager.js
docs/PROMPT_ENGINEERING.md
```

---

### PR #4: Firestore Integration for Conversation Persistence
**Priority:** P0  
**Estimated Time:** 2-3 hours  
**Day:** 2

**Tasks:**
- [ ] Set up Firestore collections (conversations, messages)
- [ ] Create data models for Conversation and Message
- [ ] Implement conversation creation endpoint
- [ ] Implement message persistence on each chat turn
- [ ] Add conversation history retrieval
- [ ] Set up Firestore real-time listeners in frontend
- [ ] Test conversation persistence across page refreshes

**Acceptance Criteria:**
- New conversations create Firestore documents
- Messages persist to Firestore in real-time
- Conversation history loads on page refresh
- Real-time updates work (new messages appear without refresh)
- Multiple conversations can be created and retrieved

**Files Created/Modified:**
```
backend/services/firestoreService.js
backend/routes/conversation.js
frontend/src/hooks/useConversation.js
```

---

### PR #5: Image Upload UI
**Priority:** P0  
**Estimated Time:** 2 hours  
**Day:** 2

**Tasks:**
- [ ] Create image upload button in chat UI
- [ ] Implement file input with accept="image/*"
- [ ] Add image preview before upload
- [ ] Support multiple image selection
- [ ] Add loading state during upload
- [ ] Display uploaded images in chat
- [ ] Handle file size limits (e.g., max 10MB)

**Acceptance Criteria:**
- User can click upload button and select images
- Multiple images can be selected at once
- Image previews display correctly
- Loading spinner shows during upload
- Uploaded images display in conversation
- Error handling for file size/type issues

**Files Created/Modified:**
```
frontend/src/components/ImageUpload.jsx
frontend/src/components/ImagePreview.jsx
```

---

### PR #6: Image Parsing with OpenAI Vision
**Priority:** P0  
**Estimated Time:** 3-4 hours  
**Day:** 2

**Tasks:**
- [ ] Create `/api/upload` endpoint
- [ ] Implement image upload to temporary storage or base64 encoding
- [ ] Integrate OpenAI Vision API via Vercel AI SDK
- [ ] Extract problem text from uploaded images
- [ ] Return parsed problem text to frontend
- [ ] Display parsed problem in chat for confirmation
- [ ] Test with printed math problems
- [ ] Handle parsing errors gracefully

**Acceptance Criteria:**
- Images upload successfully to backend
- Vision API extracts problem text accurately (>90% for printed)
- Parsed text returns to frontend
- User sees extracted problem text in chat
- Error messages display if parsing fails
- Works with PNG, JPG, HEIC formats

**Files Created/Modified:**
```
backend/routes/upload.js
backend/services/visionService.js
frontend/src/hooks/useImageUpload.js
```

---

### PR #7: Math Rendering with KaTeX
**Priority:** P0  
**Estimated Time:** 2 hours  
**Day:** 2-3

**Tasks:**
- [ ] Install KaTeX library
- [ ] Create MathDisplay component
- [ ] Parse LaTeX notation from AI responses
- [ ] Render inline math equations
- [ ] Render block math equations
- [ ] Style equations for readability
- [ ] Test with various equation types

**Acceptance Criteria:**
- LaTeX equations render beautifully in chat
- Both inline ($...$) and block ($$...$$) equations work
- Supports fractions, exponents, roots, Greek letters
- Equations are readable and properly formatted
- No rendering errors for common math notation

**Files Created/Modified:**
```
frontend/src/components/MathDisplay.jsx
frontend/src/utils/latexParser.js
```

---

### PR #8: Canvas Component Foundation
**Priority:** P0  
**Estimated Time:** 3-4 hours  
**Day:** 3

**Tasks:**
- [ ] Create Whiteboard component with Canvas element
- [ ] Set up canvas context and sizing
- [ ] Implement basic coordinate system
- [ ] Create drawing state management
- [ ] Add canvas to main layout (split view with chat)
- [ ] Test canvas renders correctly
- [ ] Make canvas responsive to window resizing

**Acceptance Criteria:**
- Canvas element renders in UI
- Canvas has proper dimensions and scaling
- Layout splits screen between chat and whiteboard
- Canvas clears properly
- No visual glitches or rendering issues

**Files Created/Modified:**
```
frontend/src/components/Whiteboard.jsx
frontend/src/hooks/useCanvas.js
frontend/src/App.jsx (update layout)
```

---

### PR #9: Step Visualization Rendering on Canvas
**Priority:** P0  
**Estimated Time:** 4-5 hours  
**Day:** 3

**Tasks:**
- [ ] Create LaTeX-to-Canvas rendering utility
- [ ] Parse AI responses for [RENDER: ...] instructions
- [ ] Implement system layer rendering (equations, diagrams, labels)
- [ ] Position elements clearly on canvas
- [ ] Clear previous step when new step renders
- [ ] Test rendering various equation types
- [ ] Add visual distinction for system-rendered content

**Acceptance Criteria:**
- System renders equations on canvas automatically
- LaTeX equations display correctly on canvas
- Labels and annotations render clearly
- Each step clears previous step appropriately
- Multiple equation types render correctly (fractions, exponents, etc.)
- System-rendered content is visually distinct from user drawings

**Files Created/Modified:**
```
frontend/src/utils/canvasRenderer.js
frontend/src/utils/latexToCanvas.js
frontend/src/components/Whiteboard.jsx (update)
```

---

### PR #10: Drawing Lock/Unlock Mechanism
**Priority:** P0  
**Estimated Time:** 2-3 hours  
**Day:** 3

**Tasks:**
- [ ] Implement drawing locked/unlocked state
- [ ] Show visual indicator when drawing is locked
- [ ] Lock drawing by default at conversation start
- [ ] Unlock drawing after system renders step visualization
- [ ] Lock drawing when progressing to next step
- [ ] Disable pointer events when locked
- [ ] Test lock/unlock flow through multi-step problem

**Acceptance Criteria:**
- Drawing starts locked
- Unlocks after system renders visualization
- Locks when moving to next step
- Visual indicator clearly shows lock state
- Pointer events disabled when locked
- Flow works smoothly through entire problem

**Files Created/Modified:**
```
frontend/src/hooks/useDrawingLock.js
frontend/src/components/Whiteboard.jsx (update)
frontend/src/components/LockIndicator.jsx
```

---

### PR #11: Basic Drawing Tools (Pen & Eraser)
**Priority:** P0  
**Estimated Time:** 3-4 hours  
**Day:** 3

**Tasks:**
- [ ] Implement pen tool for freehand drawing
- [ ] Implement eraser tool
- [ ] Add drawing tool selector UI
- [ ] Handle pointer events (down, move, up)
- [ ] Draw smooth lines between points
- [ ] Separate user layer from system layer
- [ ] Ensure only user layer is affected by eraser
- [ ] Test drawing performance and smoothness

**Acceptance Criteria:**
- Pen tool draws smooth lines
- Eraser removes user drawings only (not system visualizations)
- Tool selector UI is clear and functional
- Drawing feels responsive (60fps)
- Multiple strokes can be drawn
- Eraser has appropriate size

**Files Created/Modified:**
```
frontend/src/components/DrawingTools.jsx
frontend/src/hooks/useDrawingTools.js
frontend/src/utils/drawingEngine.js
```

---

### PR #12: Collaborative Drawing State Management
**Priority:** P0  
**Estimated Time:** 3-4 hours  
**Day:** 3-4

**Tasks:**
- [ ] Save canvas state (system layer + user layer) to Firestore
- [ ] Load canvas state when retrieving conversation
- [ ] Sync canvas state across real-time updates
- [ ] Serialize/deserialize canvas drawings
- [ ] Implement canvas state per message/step
- [ ] Test drawing persistence across page refresh

**Acceptance Criteria:**
- Canvas state saves to Firestore on each step
- Canvas state loads correctly when conversation reopens
- Both system and user layers persist
- Real-time updates sync canvas between hypothetical multiple users (foundation for collaborative)
- No data loss on page refresh

**Files Created/Modified:**
```
frontend/src/hooks/useCanvasState.js
backend/services/canvasService.js
```

---

### PR #13: Color Picker & Clear Button
**Priority:** P0  
**Estimated Time:** 2 hours  
**Day:** 4

**Tasks:**
- [ ] Add color picker UI for pen tool
- [ ] Implement color selection logic
- [ ] Add clear button for user layer
- [ ] Confirm clear action with user
- [ ] Ensure clear only affects user drawings (not system visualizations)
- [ ] Test with multiple colors

**Acceptance Criteria:**
- Color picker displays available colors
- Selected color applies to pen tool
- Clear button removes all user drawings
- Confirmation dialog prevents accidental clears
- System visualizations remain after clear
- Multiple colors can be used in same drawing

**Files Created/Modified:**
```
frontend/src/components/ColorPicker.jsx
frontend/src/components/DrawingTools.jsx (update)
```

---

### PR #14: Problem Type Testing & Bug Fixes
**Priority:** P0  
**Estimated Time:** 4-5 hours  
**Day:** 4

**Tasks:**
- [ ] Test with simple arithmetic problem
- [ ] Test with linear equation
- [ ] Test with geometry problem
- [ ] Test with word problem
- [ ] Test with multi-step problem
- [ ] Document each test walkthrough with screenshots
- [ ] Fix bugs discovered during testing
- [ ] Refine Socratic prompting based on test results

**Acceptance Criteria:**
- Successfully guides through 5+ problem types
- No direct answers given in any test
- Whiteboard visualizations clear for each problem type
- Drawing lock/unlock works consistently
- All critical bugs fixed
- Test walkthroughs documented in EXAMPLES.md

**Files Created/Modified:**
```
docs/EXAMPLES.md
(Various bug fixes across components)
```

---

### PR #15: UI Polish & Responsiveness
**Priority:** P0  
**Estimated Time:** 3-4 hours  
**Day:** 4

**Tasks:**
- [ ] Improve chat UI styling (spacing, colors, typography)
- [ ] Polish whiteboard UI (borders, shadows, backgrounds)
- [ ] Add loading states (spinner during AI response)
- [ ] Add empty states (no conversation, no messages)
- [ ] Implement responsive layout for different screen sizes
- [ ] Add error states (API errors, upload failures)
- [ ] Improve visual hierarchy
- [ ] Test on different screen sizes

**Acceptance Criteria:**
- UI looks professional and polished
- All loading states display correctly
- Empty states guide user on what to do
- Error messages are helpful and user-friendly
- Layout works on desktop (1920x1080 and 1366x768)
- Visual hierarchy is clear (user knows where to look)

**Files Created/Modified:**
```
frontend/src/styles/ (various style files)
frontend/src/components/ (update component styles)
```

---

### PR #16: Documentation & Setup Instructions
**Priority:** P0  
**Estimated Time:** 2-3 hours  
**Day:** 5

**Tasks:**
- [ ] Write comprehensive README.md
- [ ] Create SETUP.md with step-by-step instructions
- [ ] Document environment variables needed
- [ ] Add Firebase setup instructions
- [ ] Add OpenAI API key setup
- [ ] Document local development workflow
- [ ] Add troubleshooting section
- [ ] Include architecture diagram (optional but nice)

**Acceptance Criteria:**
- README clearly explains project
- SETUP.md allows someone to run project from scratch
- All required environment variables listed
- Firebase and OpenAI setup clearly explained
- Troubleshooting covers common issues

**Files Created/Modified:**
```
README.md
docs/SETUP.md
docs/ARCHITECTURE.md (optional)
.env.example
```

---

### PR #17: Deployment to Vercel
**Priority:** P0  
**Estimated Time:** 2-3 hours  
**Day:** 5

**Tasks:**
- [ ] Configure Vercel project for frontend
- [ ] Configure Vercel serverless functions for backend
- [ ] Set up environment variables in Vercel
- [ ] Test frontend deployment
- [ ] Test backend API routes in production
- [ ] Verify Firebase connection in production
- [ ] Test end-to-end flow in production
- [ ] Fix any production-specific bugs

**Acceptance Criteria:**
- Frontend deployed and accessible via public URL
- Backend API routes work in production
- Environment variables configured correctly
- Firebase works in production environment
- Image upload works in production
- Chat functionality works end-to-end
- No console errors in production

**Files Created/Modified:**
```
vercel.json
frontend/vercel.json (if needed)
backend/vercel.json (if needed)
```

---

### PR #18: Demo Video & Final QA
**Priority:** P0  
**Estimated Time:** 2-3 hours  
**Day:** 5

**Tasks:**
- [ ] Record 5-minute demo video
  - [ ] Introduction (30s)
  - [ ] Text input demo (1m)
  - [ ] Image upload demo (1m)
  - [ ] Socratic dialogue demo (1.5m)
  - [ ] Whiteboard demo (1m)
  - [ ] Conclusion (30s)
- [ ] Final QA pass on production
- [ ] Test all 5 problem types in production
- [ ] Fix any last-minute issues
- [ ] Update documentation with production URL

**Acceptance Criteria:**
- Demo video recorded and uploaded
- All features demonstrated in video
- Production app passes final QA
- Documentation includes production URL
- All deliverables complete

**Files Created/Modified:**
```
docs/DEMO_VIDEO.md (link to video)
README.md (update with production URL)
```

---

## Priority 1 (P1) - High-Value Features (Post-P0)

These PRs enhance the core experience but require P0 foundation to be complete first.

---

### PR #19: Interactive Whiteboard Enhancement
**Priority:** P1  
**Estimated Time:** 3-4 hours  
**Day:** 3-4 (after PR #13)

**Tasks:**
- [ ] Add pan and zoom functionality
- [ ] Implement touch support for tablets
- [ ] Add undo/redo for drawings
- [ ] Improve drawing smoothness (line smoothing algorithm)
- [ ] Add highlighter tool (semi-transparent)
- [ ] Add shape tools (line, circle, rectangle) - optional
- [ ] Test on different devices

**Acceptance Criteria:**
- Pan and zoom work smoothly
- Touch drawing works on tablets
- Undo/redo work correctly (up to 20 steps)
- Drawing feels very smooth
- Highlighter tool works with transparency
- All tools tested on desktop and tablet

**Files Created/Modified:**
```
frontend/src/hooks/useCanvasZoom.js
frontend/src/utils/lineSmoothing.js
frontend/src/hooks/useDrawingHistory.js
```

---

### PR #20: Advanced Image Parsing (Handwritten)
**Priority:** P1  
**Estimated Time:** 2-3 hours  
**Day:** 2-3 (after PR #6)

**Tasks:**
- [ ] Test Vision API with handwritten math problems
- [ ] Improve prompt for better handwriting recognition
- [ ] Add confidence scores for parsed text
- [ ] Allow user to correct parsed text before starting
- [ ] Test with various handwriting styles
- [ ] Document handwriting recognition limitations

**Acceptance Criteria:**
- Handwritten problems parse with >70% accuracy
- User can edit parsed text before confirming
- Clear messaging when confidence is low
- Documentation notes which handwriting styles work best

**Files Created/Modified:**
```
backend/services/visionService.js (update)
frontend/src/components/ParsedProblemConfirmation.jsx
```

---

## Priority 2 (P2) - Voice Interface (Post-P0 & P1)

This PR should only be started after all P0 features are complete and polished.

---

### PR #21: Voice Interface (TTS + STT)
**Priority:** P2  
**Estimated Time:** 4-5 hours  
**Day:** 4-5 (only after whiteboard + step viz are polished)

**Tasks:**
- [ ] Install Web Speech API (browser native)
- [ ] Implement Text-to-Speech for tutor responses
- [ ] Implement Speech-to-Text for student input
- [ ] Add microphone button UI
- [ ] Add speaker toggle button UI
- [ ] Implement voice activity indicator (waveform or pulsing)
- [ ] Handle browser compatibility (feature detection)
- [ ] Add error handling for voice failures
- [ ] Test on multiple browsers
- [ ] Fallback to text-only if voice not supported

**Acceptance Criteria:**
- TTS reads tutor responses aloud
- STT captures student speech and converts to text
- Microphone button starts/stops listening
- Speaker button enables/disables TTS
- Visual feedback shows when voice is active
- Works on Chrome, Firefox, Safari, Edge
- Graceful fallback when voice not supported
- Error messages help user troubleshoot

**Files Created/Modified:**
```
frontend/src/components/VoiceControls.jsx
frontend/src/hooks/useTextToSpeech.js
frontend/src/hooks/useSpeechToText.js
frontend/src/utils/voiceFeatureDetection.js
```

---

## Summary: MVP PR Sequence

### Week 1 (Days 1-5)

**Day 1: Foundation**
- PR #1: Project setup
- PR #2: Basic chat UI
- PR #3: Socratic prompting

**Day 2: Input & Persistence**
- PR #4: Firestore integration
- PR #5: Image upload UI
- PR #6: Image parsing (printed)
- PR #7: Math rendering

**Day 3: Whiteboard Core**
- PR #8: Canvas foundation
- PR #9: Step visualization
- PR #10: Drawing lock/unlock
- PR #11: Drawing tools
- PR #12: Canvas state management

**Day 4: Polish & Enhancements**
- PR #13: Color picker & clear
- PR #14: Problem testing & bugs
- PR #15: UI polish
- PR #19: Whiteboard enhancements (P1)
- PR #20: Handwritten parsing (P1)

**Day 5: Deployment & Documentation**
- PR #16: Documentation
- PR #17: Vercel deployment
- PR #18: Demo video & QA
- PR #21: Voice interface (P2) - only if time permits

---

## Critical Path

**Must Complete for MVP:**
- PR #1 → #2 → #3 (Day 1: Chat foundation)
- PR #4 → #5 → #6 (Day 2: Input system)
- PR #7 (Math rendering - can parallel with #4-6)
- PR #8 → #9 → #10 → #11 → #12 (Day 3: Whiteboard)
- PR #13 → #14 → #15 (Day 4: Testing & polish)
- PR #16 → #17 → #18 (Day 5: Ship it)

**Optional if Time Permits:**
- PR #19: Whiteboard enhancements
- PR #20: Handwritten support
- PR #21: Voice interface

**Not in MVP (Stretch Goals):**
- Animation for step visualization
- Animated avatar
- Difficulty modes
- Problem generation
- Image cleanup with TTL

---

## Notes on Prioritization

**Why This Order:**

1. **P0 First:** All core features must work before adding enhancements
2. **Chat Before Canvas:** Need working AI conversation before visual features
3. **Canvas Foundation Before Drawing:** Rendering must work before interaction
4. **Drawing Before Voice:** Visual learning is more critical than audio
5. **Testing Before Deployment:** Can't ship untested code
6. **Voice Last:** Nice-to-have that can be dropped if timeline is tight

**Decision Points:**

- **End of Day 3:** Assess if whiteboard is on track. If behind, skip PR #19.
- **End of Day 4:** Assess if ready to deploy. If behind, skip PR #20 and #21.
- **Day 5 Morning:** Make final call on voice interface (PR #21) based on overall status.

**Quality Gates:**

- Don't move to next priority tier until current tier is polished
- If running behind, cut lower priority features rather than ship buggy code
- Voice (P2) is explicitly optional - only add if P0 is perfect

---

## PR Best Practices

**Each PR Should:**
- [ ] Have a clear, single focus
- [ ] Include tests (manual testing checklist minimum)
- [ ] Update relevant documentation
- [ ] Have descriptive commit messages
- [ ] Be small enough to review in 15-30 minutes
- [ ] Pass all acceptance criteria before merging

**Branch Naming Convention:**
```
feature/pr-01-project-setup
feature/pr-02-chat-ui
feature/pr-03-socratic-prompting
...
```

**Commit Message Format:**
```
[PR-01] Initialize React + Vite project

- Set up project structure
- Configure environment variables
- Add Firebase connection
```

---

*End of PR Breakdown*