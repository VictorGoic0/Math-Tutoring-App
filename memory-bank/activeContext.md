# Active Context

## Current Work Focus

**Recent Completion:** Canvas Graph Rendering System TDD v2.0 - ✅ COMPLETE

**Latest Changes:**
- Completely revised Graph Revamp TDD to v2.0 with major simplifications
- Reduced LLM tool calls to equations/coordinates only (no styling params)
- Fixed coordinate bounds to -10 to +10 (no zoom/pan for MVP)
- Switched state management from useState/useReducer to Zustand
- Reduced tool set from 6 to 5 (linear, quadratic, circle, square, triangle)
- Created `tasks-3.md` with 10 MVP PRs + 5 post-MVP PRs
- Updated TDD with comprehensive implementation guide

**Next Priority:** Implement Graph Rendering System (tasks-3.md PRs #1-10)

**Current Task:**
- Ready to begin implementation of new graph rendering system
- Start with PR #1: State Management & Infrastructure Setup
- Follow task breakdown in tasks-3.md
- Timeline: 3-5 days for MVP implementation

## Recent Decisions

### 1. Graph Rendering System Simplification (Graph TDD v2.0)

**Decision:** Drastically simplify LLM tool calls and fix coordinate bounds for MVP

**Key Changes:**
- LLM provides ONLY equations (e.g., "2*x + 3") or coordinates
- NO styling parameters (color, label, fill, showVertex, etc.)
- Frontend controls all rendering decisions (blue color, 2px line width)
- Fixed -10 to +10 coordinate bounds (no zoom/pan)
- Zustand for centralized state management
- Reduced tool set: linear, quadratic, circle, square, triangle (5 tools)

**Rationale:**
- Fewer LLM parameters = fewer hallucinations, more reliability
- Fixed bounds simplify coordinate math and testing
- Frontend control ensures consistent styling
- Faster MVP implementation (3-5 days vs 7-10 days)

**Impact:**
- Tool calls are minimal and predictable
- All system renders use consistent blue styling
- Coordinate transformations are simpler
- State changes easier to track with Zustand
- Clear separation: LLM = data, Frontend = presentation

### 2. Firebase Admin Removal (PR #18)

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

1. **Graph System PR #1 - State Management Setup:**
   - Install `zustand` and `mathjs` dependencies
   - Create `canvasStore.js` with fixed bounds (-10 to +10)
   - Add actions: addSystemRender, clearSystemRenders, clearAllCanvas
   - Test store with simple state updates

2. **Graph System PR #2 - Coordinate System & Grid:**
   - Implement `worldToCanvas` and `canvasToWorld` transformations
   - Write unit tests for coordinate transforms
   - Create grid rendering function with fixed bounds
   - Add axis labels and tick marks

3. **Graph System PR #3 - Core Canvas Component:**
   - Create `GraphCanvas.jsx` using Zustand
   - Connect to canvas store for bounds and renders
   - Implement canvas ref and context setup
   - Add effect to redraw on state changes

### Short Term

4. **Graph System PR #4-5 - Shape Renderers:**
   - Implement renderLinearFunction and renderQuadraticFunction
   - Implement renderCircle, renderSquare, renderTriangle
   - Create unified renderSystemShape dispatcher
   - Test each renderer with hardcoded data

5. **Graph System PR #6-8 - Integration:**
   - Define 5 simplified tool schemas
   - Update system prompt with coordinate bounds
   - Create useChatToolCalls hook
   - Integrate GraphCanvas into Chat component

### Medium Term

6. **Graph System PR #9-10 - Polish & Testing:**
   - Add comprehensive error handling
   - Test all 5 tool types end-to-end
   - Cross-browser testing
   - Write inline documentation

7. **Post-MVP Features (Future):**
   - User drawing layer
   - Zoom/pan controls
   - Additional shapes
   - Vertex/root highlighting
   - Export to PNG/SVG

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
1. Read `tasks-3.md` for new graph rendering system PRs
2. Read `Graph-Revamp-TDD.md` for complete technical design
3. Check `PRD.md` for product requirements
4. Review `systemPatterns.md` for architecture decisions
5. Check `techContext.md` for technology stack and setup

**Current State:**
- Core chat features complete and working
- UI polished with design system
- Deployed to Vercel (separate frontend/backend projects)
- Old canvas system (tasks-1/tasks-2) being replaced
- New graph rendering system TDD complete (v2.0)
- Ready to implement new system from tasks-3.md

**Next Priority:**
- Implement new graph rendering system (tasks-3.md)
- Start with PR #1: State Management & Infrastructure
- Follow 10-PR implementation plan
- Timeline: 3-5 days for MVP

**Key Documents:**
- `Graph-Revamp-TDD.md` - Complete technical design (v2.0)
- `tasks-3.md` - 10 MVP PRs + 5 post-MVP PRs
- `TDD-UPDATE-SUMMARY.md` (deleted) - Summary of changes made

