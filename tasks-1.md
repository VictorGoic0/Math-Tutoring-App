# Canvas & Whiteboard Tasks

### PR #1: Canvas Component Foundation
**Priority:** P0  
**Day:** 3

**Tasks:**
- [ ] Install Zustand for canvas state management
- [ ] Create canvasStore with initial state (strokes, systemRenders, currentTool, color, isLocked)
- [ ] Create Whiteboard component with Canvas element
- [ ] Set up canvas context and sizing
- [ ] Implement basic coordinate system
- [ ] Integrate Zustand store for drawing state management
- [ ] Add canvas to main layout (split view with chat)
- [ ] Test canvas renders correctly
- [ ] Make canvas responsive to window resizing

**Acceptance Criteria:**
- Canvas element renders in UI
- Canvas has proper dimensions and scaling
- Layout splits screen between chat and whiteboard
- Canvas clears properly
- No visual glitches or rendering issues
- Zustand store manages canvas state correctly

**Files Created/Modified:**
```
frontend/src/components/Whiteboard.jsx
frontend/src/stores/canvasStore.js  // NEW - Zustand store
frontend/src/App.jsx (update layout)
```

### PR #2: Step Visualization Rendering on Canvas
**Priority:** P0  
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

### PR #3: Drawing Lock/Unlock Mechanism
**Priority:** P0  
**Day:** 3

**Tasks:**
- [ ] Implement drawing locked/unlocked state in canvasStore
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
frontend/src/stores/canvasStore.js  // Update with lock state
frontend/src/components/Whiteboard.jsx (update)
frontend/src/components/LockIndicator.jsx
```

### PR #4: Basic Drawing Tools (Pen & Eraser)
**Priority:** P0  
**Day:** 3

**Tasks:**
- [ ] Implement pen tool for freehand drawing (update strokes in canvasStore)
- [ ] Implement eraser tool (remove strokes from canvasStore)
- [ ] Add drawing tool selector UI
- [ ] Handle pointer events (down, move, up)
- [ ] Draw smooth lines between points
- [ ] Separate user layer from system layer in store
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
frontend/src/hooks/useDrawingTools.js  // Integrate with canvasStore
frontend/src/utils/drawingEngine.js
```

### PR #5: Collaborative Drawing State Management
**Priority:** P0  
**Day:** 3-4

**Tasks:**
- [ ] Implement saveToFirestore action in canvasStore (serialize strokes and systemRenders to JSON)
- [ ] Implement loadFromFirestore action in canvasStore (load and set state from Firestore)
- [ ] Add Firestore integration for canvas state persistence (subcollection: /conversations/{id}/canvasStates)
- [ ] Load canvas state when retrieving conversation
- [ ] Sync canvas state on changes (debounced auto-save)
- [ ] Implement canvas state per message/step (store snapshots)
- [ ] Test drawing persistence across page refresh

**Acceptance Criteria:**
- Canvas state saves to Firestore on each step
- Canvas state loads correctly when conversation reopens
- Both system and user layers persist
- Real-time updates sync canvas between hypothetical multiple users (foundation for collaborative)
- No data loss on page refresh

**Files Created/Modified:**
```
frontend/src/stores/canvasStore.js  // Update with persistence actions
frontend/src/services/chatService.js  // Update to include canvas state in conversation
```

### PR #6: Color Picker & Clear Button
**Priority:** P0  
**Day:** 4

**Tasks:**
- [ ] Add color picker UI for pen tool
- [ ] Implement color selection logic (update color in canvasStore)
- [ ] Add clear button for user layer (clear strokes in canvasStore)
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

### PR #7: Problem Type Testing & Bug Fixes
**Priority:** P0  
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