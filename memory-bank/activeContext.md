# Active Context

## Current Work Focus

**Recent Completion:** PR #3 (Drawing Lock/Unlock Mechanism) - ✅ COMPLETE

**Latest Changes:**
- Implemented lock/unlock state with visual indicator (low-profile lock icon)
- Canvas starts locked, auto-unlocks after system renders
- Locks again when progressing to next step (clear_canvas)
- Added step tracking foundation (steps array, createStep, currentStepIndex)
- Fixed canvas hide/show to preserve drawings (keep mounted, use visibility CSS)
- Added fallback "Done!" message when AI calls tools without text
- Canvas clears when conversation is deleted

**Next Priority:** PR #4 Phase 1 (Step Navigation with Arrow Keys)

**Current Task:**
- Implementing step navigation UI with left/right arrow buttons
- Adding global keyboard listeners for left/right arrow keys
- Updating canvas to render systemRenders from selected step
- Phase 2 (Firestore persistence) will follow after Phase 1 completion

## Recent Decisions

### 1. Firebase Admin Removal (PR #18)

**Decision:** Remove Firebase Admin SDK from backend entirely

**Reason:**
- Persistent incompatibility with Vercel serverless cold starts
- Environment variables not available at module load time
- Lazy initialization attempts still failed intermittently

**Impact:**
- All Firestore operations moved to frontend
- Backend simplified to pure OpenAI API proxy
- Security enforced by Firestore Security Rules
- Simpler, more reliable architecture

### 2. Manual State Management (PR #7)

**Decision:** Remove `useChat` hook, use manual state management

**Reason:**
- Full control over chat state
- Simpler debugging
- No dependency on Vercel AI SDK for frontend

**Impact:**
- Manual `useState` hooks for messages, input, loading
- Custom streaming via `fetch` + `parseAIStream`
- More code but more control

### 3. Single Conversation Per User

**Decision:** Simplified MVP approach - one conversation per user

**Reason:**
- Faster development
- Simpler state management
- Sufficient for MVP

**Impact:**
- No conversation switching UI needed
- Get-or-create pattern for conversation
- All messages belong to same conversation

## Next Steps

### Immediate (Current Session)

1. **Step Navigation (PR #4 Phase 1):**
   - Add navigation actions to canvasStore (goToStep, goToNextStep, goToPreviousStep)
   - Add left/right arrow buttons to Whiteboard component
   - Implement global keyboard listeners for arrow keys (preventDefault/stopPropagation)
   - Update canvas rendering to show systemRenders from selected step
   - Disable navigation buttons at bounds

### Short Term

2. **Step Persistence (PR #4 Phase 2):**
   - Add steps property to conversation document in Firestore
   - Save steps to Firestore after each step creation (background)
   - Load steps on page refresh and default to last step
   - Render systemRenders from persisted step data

3. **Enhanced Graph Visualizations (PR #5):**
   - Auto-detect linear equations and switch to graph mode
   - Add graph background rendering (axes, grid)
   - Ensure AI understands shapes are on graph coordinates
   - Grid visibility based on shape types

4. **Diagram Rendering Fixes (PR #6):**
   - Fix inconsistencies in shape rendering
   - Standardize styling parameters
   - Handle edge cases and validation

### Medium Term

4. **Problem Type Testing (PR #7):**
   - Test with various math problem types
   - Verify whiteboard rendering works correctly
   - Fix bugs discovered during testing

## Active Considerations

### UI/UX Improvements

1. **Spacing Refinement:**
   - ✅ Reduced spacing between header and message list (just completed)
   - ✅ Decreased space around delete button (just completed)
   - Consider: Further spacing optimizations based on user feedback

2. **Design System:**
   - ✅ Integrated Input, Card, Button components
   - ✅ Applied design tokens throughout
   - Consider: Refactor all styles to match design system pattern (optional task)

### Technical Debt

1. **Error Handling:**
   - Backend has comprehensive error handling
   - Frontend has user-friendly error messages
   - Consider: More specific error types for better UX

2. **Performance:**
   - Optimistic UI working well
   - Streaming responses working smoothly
   - Consider: Image compression before upload

3. **Testing:**
   - Manual testing completed for core features
   - Consider: Automated tests for critical paths

## Known Issues

### None Currently

All reported issues have been resolved:
- ✅ First AI response not saving (fixed: await conversationId)
- ✅ Empty conversation state (fixed: redesigned with welcome message)
- ✅ Chat window hugging bottom (fixed: flex layout adjustments)
- ✅ Page scrolling instead of MessageList (fixed: global styles)

## Blockers

**None Currently**

All blockers have been resolved:
- ✅ Firebase Admin Vercel compatibility (resolved: removed Firebase Admin)
- ✅ CORS errors (resolved: enabled CORS in production)
- ✅ Routing issues (resolved: removed /api prefix, added vercel.json)

## Context for Next Developer Session

**If starting fresh:**
1. Read `tasks.md` for full PR breakdown and current status
2. Check `PRD.md` for product requirements (updated to match current state)
3. Review `systemPatterns.md` for architecture decisions
4. Check `techContext.md` for technology stack and setup

**Current State:**
- Core chat features complete and working
- UI polished with design system
- Deployed to Vercel (separate frontend/backend projects)
- Canvas foundation complete (PR #1)
- Canvas step visualization complete (PR #2)
- Drawing lock/unlock complete (PR #3)
- Step navigation (PR #4 Phase 1) in progress
- Voice interface not yet started

**Next Priority:**
- Complete step navigation UI and keyboard controls (PR #4 Phase 1)
- Implement Firestore persistence for steps (PR #4 Phase 2)
- Enhanced graph visualizations (PR #5)
- Diagram rendering fixes (PR #6)

