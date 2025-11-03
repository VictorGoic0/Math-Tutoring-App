# Active Context

## Current Work Focus

**Status:** Project initialization phase  
**Phase:** Pre-development setup

The project is in the very early stages. Basic package.json files exist for both frontend and backend, but no actual implementation has started yet.

## Recent Changes

- Created basic project structure (frontend/ and backend/ directories)
- Initialized package.json files (minimal, no dependencies yet)
- Memory bank initialization (this document)

## Next Steps

### Immediate (Day 1)
1. **PR #1: Project Setup & Basic Infrastructure**
   - Initialize React + Vite project
   - Set up Express backend
   - Configure environment variables
   - Set up Firebase project and Firestore
   - Install Vercel AI SDK dependencies
   - Configure CORS and basic API routes

2. **PR #2: Basic Chat UI with Vercel AI SDK**
   - Create Chat component
   - Implement text input
   - Integrate `useChat()` hook
   - Create `/api/chat` endpoint
   - Connect to OpenAI GPT-4

3. **PR #3: Socratic Prompting System**
   - Create Socratic system prompt
   - Implement prompt in `/api/chat`
   - Test with hardcoded problem

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

None identified yet - project just starting.

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

