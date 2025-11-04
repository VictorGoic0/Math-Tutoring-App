# Active Context

## Current Work Focus

**Status:** PR #3 Fully Complete & Tested  
**Phase:** Day 1 Foundation Complete - Ready for PR #4

All Day 1 PRs (#1, #2, #3) are complete and tested. The chat interface is working end-to-end with OpenAI GPT-4 Turbo. Authentication, streaming, and error handling all functional. Ready to begin PR #4: Socratic Prompting System.

## Recent Changes

### Just Completed (PR #3) - FULLY TESTED
- ✅ Integrated `useChat` hook (AI SDK v3: `ai/react`)
- ✅ Created `/api/chat` endpoint with streaming (pipeDataStreamToResponse)
- ✅ Connected OpenAI GPT-4 Turbo and verified working
- ✅ Fixed Firebase Admin SDK exports and property names
- ✅ Converted backend to CommonJS for proper env loading
- ✅ Downgraded AI SDK to v3 for model compatibility
- ✅ Added comprehensive error handling (all levels)
- ✅ Auth working end-to-end
- ✅ Tested full chat flow successfully

### Previously Completed (PR #1 & #2)
- ✅ React + Vite frontend setup
- ✅ Express backend setup
- ✅ Firebase Auth + Firestore + Storage initialized
- ✅ Login/SignUp components
- ✅ AuthContext + useAuth hook
- ✅ Protected routes with React Router
- ✅ Auth middleware on backend

## Next Steps

### Immediate - Start PR #4
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

None! All Day 1 PRs complete and tested. Ready to proceed with PR #4.

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

