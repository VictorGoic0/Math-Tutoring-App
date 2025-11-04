# Active Context

## Current Work Focus

**Status:** PR #3 Complete - Ready for Testing  
**Phase:** Day 1 Foundation Complete, Manual Testing Required

All Day 1 PRs (#1, #2, #3) are code-complete. The chat interface is built and connected to OpenAI GPT-4 Turbo via Vercel AI SDK. Now ready for manual testing to verify the complete flow works end-to-end.

## Recent Changes

### Just Completed (PR #3)
- ✅ Integrated `useChat` hook with correct import (`@ai-sdk/react`)
- ✅ Created `/api/chat` endpoint with streaming support
- ✅ Connected OpenAI GPT-4 Turbo via Vercel AI SDK
- ✅ Added auth middleware to protect chat endpoint
- ✅ Added CORS fallbacks for local development
- ✅ Added API URL fallback in Chat component
- ✅ Created TESTING_PR3.md guide
- ✅ Documented correct SDK imports in memory bank and cursor rules

### Previously Completed (PR #1 & #2)
- ✅ React + Vite frontend setup
- ✅ Express backend setup
- ✅ Firebase Auth + Firestore + Storage initialized
- ✅ Login/SignUp components
- ✅ AuthContext + useAuth hook
- ✅ Protected routes with React Router
- ✅ Auth middleware on backend

## Next Steps

### Immediate - Testing Required
1. **Manual Testing of PR #3** (see TESTING_PR3.md)
   - Start backend server: `cd api && npm run dev`
   - Start frontend server: `cd frontend && npm run dev`
   - Log in to the application
   - Test chat with math problems
   - Verify streaming works
   - Verify error handling
   - Mark task #8 complete once testing passes

### After Testing Passes
2. **PR #4: Socratic Prompting System**
   - Create Socratic system prompt (follow PRD template)
   - Implement prompt in `/api/chat` endpoint
   - Add conversation context management
   - Test with hardcoded math problem: "2x + 5 = 13"
   - Verify AI never gives direct answers
   - Test hint triggering after 2+ stuck turns

3. **PR #5: Firestore Integration for Conversation Persistence**
   - Set up Firestore collections structure
   - Implement conversation creation endpoint
   - Persist messages on each turn
   - Add conversation history retrieval

## Active Decisions & Considerations

### Pending Decisions
1. **Styling Approach:** Need to decide on CSS framework/approach (styled-components, Tailwind, plain CSS)
2. **Image Storage:** Base64 encoding vs. temporary file storage vs. Firebase Storage
3. **Canvas Rendering Library:** How exactly to render LaTeX on canvas (KaTeX to offscreen canvas, custom renderer, etc.)
4. **Voice Implementation Timing:** Decide if voice (P2) will be included in MVP based on timeline

### Current Priorities
- **P0 Features First:** All core features must work before enhancements
- **Chat Before Canvas:** Need working AI conversation before visual features
- **Canvas Foundation Before Drawing:** Rendering must work before interaction
- **Testing Critical:** Can't ship untested code

## Current Blockers

**⚠️ TESTING REQUIRED:** PR #3 is code-complete but needs manual testing before moving to PR #4.

**Testing Checklist:**
- [ ] Backend server runs without errors
- [ ] Frontend server runs without errors
- [ ] User can log in successfully
- [ ] Chat interface displays
- [ ] Messages can be sent
- [ ] AI responses stream back
- [ ] Error handling works
- [ ] Auth token is sent with requests

**Once testing passes:** Move to PR #4 (Socratic Prompting)

## Active Considerations

1. **Timeline Pressure:** 3-5 day timeline is aggressive - need to prioritize carefully
2. **Voice Feature:** P2 priority - can be dropped if timeline is tight
3. **Handwritten Recognition:** Lower priority than printed text
4. **Quality vs. Speed:** Need to balance feature completeness with timeline

## Testing Strategy

- Manual testing with 5+ problem types
- Verify AI never gives direct answers
- Test drawing lock/unlock flow
- Test image upload and parsing
- Browser compatibility testing
- Responsive design testing

## Documentation Needs

- README.md with setup instructions
- SETUP.md with detailed setup steps
- EXAMPLES.md with problem walkthroughs
- PROMPT_ENGINEERING.md with prompt notes
- .env.example files

