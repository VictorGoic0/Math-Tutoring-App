# Canvas Graph Rendering System - Implementation Tasks

## PR #1: State Management & Infrastructure Setup
**Priority:** MVP (First - Foundation)

**Overview:** Set up Zustand store for canvas state management and install required dependencies for math evaluation and rendering.

**Tasks:**
- [ ] Install dependencies: `zustand` and `mathjs`
- [ ] Create canvas store (`frontend/src/stores/canvasStore.js`)
- [ ] Define fixed coordinate bounds (-10 to +10) in store
- [ ] Add store actions: `addSystemRender`, `clearSystemRenders`, `clearAllCanvas`
- [ ] Add store action: `updateCanvasSize` for responsive canvas
- [ ] Create store selectors for bounds and system renders
- [ ] Write unit tests for store actions

**Acceptance Criteria:**
- Zustand store successfully manages canvas state
- Fixed bounds (-10 to +10) are immutable
- Store actions update state correctly
- System renders array can be populated and cleared
- Canvas size updates propagate to bounds object

**Files Created/Modified:**
```
frontend/src/stores/canvasStore.js  // New Zustand store
frontend/package.json  // Add dependencies
```

---

## PR #2: Coordinate System & Grid Rendering
**Priority:** MVP (Second - Core Math)

**Overview:** Implement coordinate transformation utilities and static grid renderer with fixed -10 to +10 bounds.

**Tasks:**
- [ ] Create `frontend/src/utils/coordinateTransform.js`
- [ ] Implement `worldToCanvas(x, y, bounds)` function
- [ ] Implement `canvasToWorld(canvasX, canvasY, bounds)` function
- [ ] Write unit tests for coordinate transformations
- [ ] Create `frontend/src/utils/gridRenderer.js`
- [ ] Implement `drawGrid(ctx, bounds)` with axes, tick marks, and labels
- [ ] Test grid renders correctly with fixed bounds

**Acceptance Criteria:**
- Coordinate transformations are mathematically correct
- Origin (0,0) maps to center of canvas
- Grid displays all integers from -10 to +10
- X and Y axes are clearly marked
- Tick marks and labels are legible
- Grid updates when canvas size changes

**Files Created/Modified:**
```
frontend/src/utils/coordinateTransform.js  // New utility
frontend/src/utils/gridRenderer.js  // New utility
```

---

## PR #3: Core Canvas Component
**Priority:** MVP (Third - UI Foundation)

**Overview:** Create the main GraphCanvas component that consumes Zustand store and renders the three-layer architecture.

**Tasks:**
- [ ] Create `frontend/src/components/GraphCanvas.jsx`
- [ ] Set up canvas ref and 2D context
- [ ] Connect to Zustand store for bounds and renders
- [ ] Implement useEffect to redraw on state changes
- [ ] Render Layer 1: Grid (static background)
- [ ] Render Layer 2: System renders (AI shapes/functions)
- [ ] Render Layer 3: User strokes (placeholder for future)
- [ ] Add responsive canvas sizing
- [ ] Test canvas renders and updates correctly

**Acceptance Criteria:**
- Canvas displays fixed -10 to +10 grid
- Canvas updates when system renders are added to store
- Component re-renders efficiently on state changes
- Canvas is responsive to container size
- No memory leaks or performance issues

**Files Created/Modified:**
```
frontend/src/components/GraphCanvas.jsx  // New component
```

---

## PR #4: Shape Rendering Functions - Part 1 (Functions)
**Priority:** MVP (Fourth - Math Functions)

**Overview:** Implement rendering functions for linear and quadratic equations using math.js evaluation.

**Tasks:**
- [ ] Create `frontend/src/utils/shapeRenderer.js`
- [ ] Define rendering constants (`SYSTEM_COLOR`, `SYSTEM_LINE_WIDTH`)
- [ ] Implement `renderLinearFunction(ctx, { equation }, bounds)`
- [ ] Implement `renderQuadraticFunction(ctx, { equation }, bounds)`
- [ ] Add error handling for invalid equations
- [ ] Handle equations that extend beyond bounds
- [ ] Test with various equation formats
- [ ] Verify rendering accuracy against expected outputs

**Acceptance Criteria:**
- Linear functions render as straight lines across viewport
- Quadratic functions render as smooth parabolas
- Uses math.js to evaluate equations safely
- Handles edge cases (vertical lines, asymptotes)
- All functions render in consistent blue color
- Line width is uniform (2px)

**Files Created/Modified:**
```
frontend/src/utils/shapeRenderer.js  // New utility
```

---

## PR #5: Shape Rendering Functions - Part 2 (Geometric Shapes)
**Priority:** MVP (Fifth - Shapes)

**Overview:** Implement rendering functions for circle, square, and triangle using coordinate-based drawing.

**Tasks:**
- [ ] Implement `renderCircle(ctx, { centerX, centerY, radius }, bounds)`
- [ ] Implement `renderSquare(ctx, { topLeftX, topLeftY, ... }, bounds)`
- [ ] Implement `renderTriangle(ctx, { vertex1X, vertex1Y, ... }, bounds)`
- [ ] Add coordinate validation (within -10 to +10 bounds)
- [ ] Draw vertex/center points for shapes
- [ ] Create unified `renderSystemShape(ctx, render, bounds)` dispatcher
- [ ] Test all shape types render correctly
- [ ] Handle out-of-bounds coordinates gracefully

**Acceptance Criteria:**
- Circle renders with correct center and radius
- Square renders connecting all four corners
- Triangle renders connecting all three vertices
- All shapes use consistent blue styling
- Vertex points are marked for visibility
- Out-of-bounds shapes display warning but don't crash

**Files Created/Modified:**
```
frontend/src/utils/shapeRenderer.js  // Extend existing
```

---

## PR #6: OpenAI Tool Definitions & System Prompt Update
**Priority:** MVP (Sixth - LLM Integration)

**Overview:** Define simplified tool schemas and update system prompt with coordinate bounds information.

**Tasks:**
- [ ] Update `api/services/promptService.js` with new system prompt
- [ ] Add coordinate plane details (-10 to +10 bounds)
- [ ] Define `draw_linear_function` tool (equation only)
- [ ] Define `draw_quadratic_function` tool (equation only)
- [ ] Define `draw_circle` tool (center + radius)
- [ ] Define `draw_square` tool (4 corners)
- [ ] Define `draw_triangle` tool (3 vertices)
- [ ] Remove all styling parameters from tool definitions
- [ ] Add tool usage examples to system prompt
- [ ] Test prompt with mock LLM calls

**Acceptance Criteria:**
- System prompt clearly explains coordinate bounds
- Tool definitions are minimal (no color/label/fill params)
- LLM understands it should only provide equations/coordinates
- Tool examples demonstrate correct usage
- Prompt emphasizes Socratic tutoring approach

**Files Created/Modified:**
```
api/services/promptService.js  // Update system prompt and tools
```

---

## PR #7: Chat Integration & Tool Call Parser
**Priority:** MVP (Seventh - End-to-End)

**Overview:** Parse LLM tool calls from chat messages and add them to canvas store for rendering.

**Tasks:**
- [ ] Create `frontend/src/hooks/useChatToolCalls.js`
- [ ] Parse tool calls from chat message stream
- [ ] Filter for drawing tools only (`draw_*`)
- [ ] Extract and validate tool parameters
- [ ] Add parsed renders to Zustand store
- [ ] Handle JSON parsing errors gracefully
- [ ] Integrate with existing Chat component
- [ ] Test end-to-end with mock tool calls

**Acceptance Criteria:**
- Tool calls from LLM trigger canvas renders
- Only drawing tools are processed
- Invalid tool calls don't crash the app
- Canvas updates in real-time as messages stream
- Multiple tool calls in one message work correctly

**Files Created/Modified:**
```
frontend/src/hooks/useChatToolCalls.js  // New hook
frontend/src/components/Chat.jsx  // Integrate hook
```

---

## PR #8: Canvas Controls & UI Integration
**Priority:** MVP (Eighth - UX)

**Overview:** Add canvas controls (clear button) and integrate GraphCanvas into the main chat interface.

**Tasks:**
- [ ] Add "Clear Canvas" button to UI
- [ ] Connect button to `clearAllCanvas` store action
- [ ] Position GraphCanvas in Chat layout
- [ ] Make canvas responsive to container size
- [ ] Add loading state for canvas initialization
- [ ] Style canvas container with border/shadow
- [ ] Test UI on different screen sizes
- [ ] Ensure canvas doesn't interfere with chat scrolling

**Acceptance Criteria:**
- Clear button successfully removes all renders
- Canvas is visible and properly positioned
- Layout works on desktop and tablet sizes
- Canvas doesn't obstruct chat messages
- UI feels polished and professional

**Files Created/Modified:**
```
frontend/src/components/Chat.jsx  // Add canvas and controls
frontend/src/components/CanvasControls.jsx  // New component (optional)
```

---

## PR #9: Error Handling & Edge Cases
**Priority:** MVP (Ninth - Robustness)

**Overview:** Add comprehensive error handling for invalid equations, out-of-bounds coordinates, and edge cases.

**Tasks:**
- [ ] Add try-catch blocks for math.js evaluation
- [ ] Validate coordinate bounds (-10 to +10)
- [ ] Handle undefined/null parameters gracefully
- [ ] Display user-friendly error messages
- [ ] Log errors to console for debugging
- [ ] Test with intentionally invalid inputs
- [ ] Add error recovery mechanisms
- [ ] Document common error scenarios

**Acceptance Criteria:**
- Invalid equations show error without crashing
- Out-of-bounds coordinates are clamped or warned
- User sees helpful error messages
- App remains stable after errors
- Errors are logged for debugging

**Files Created/Modified:**
```
frontend/src/utils/shapeRenderer.js  // Add error handling
frontend/src/utils/errorHandler.js  // New utility (optional)
```

---

## PR #10: Testing & Documentation
**Priority:** MVP (Tenth - Quality Assurance)

**Overview:** Write comprehensive tests and documentation for the canvas rendering system.

**Tasks:**
- [ ] Write unit tests for coordinate transformations
- [ ] Write unit tests for Zustand store actions
- [ ] Write integration tests for tool call parsing
- [ ] Test all 5 tool types end-to-end
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Add inline code documentation
- [ ] Document tool usage in README
- [ ] Create troubleshooting guide

**Acceptance Criteria:**
- All unit tests pass
- Code coverage > 80% for canvas utilities
- End-to-end tests verify full workflow
- Works consistently across browsers
- Documentation is clear and helpful

**Files Created/Modified:**
```
frontend/src/utils/__tests__/coordinateTransform.test.js  // New tests
frontend/src/stores/__tests__/canvasStore.test.js  // New tests
frontend/src/hooks/__tests__/useChatToolCalls.test.js  // New tests
README.md  // Add canvas system documentation
```

---

## Post-MVP Enhancements (Future PRs)

### PR #11: User Drawing Layer
- Implement pen tool for freehand drawing
- Add color picker and line width controls
- Persist user strokes alongside system renders
- Add eraser functionality

### PR #12: Zoom & Pan Controls
- Add mouse wheel zoom
- Implement click-drag panning
- Update bounds dynamically
- Maintain render quality at different zoom levels

### PR #13: Advanced Function Features
- Add vertex highlighting for quadratics
- Show x-intercepts (roots) for functions
- Display slope triangles for linear functions
- Add function labels with equations

### PR #14: Additional Shapes & Tools
- Add polygon tool (arbitrary n-sided shapes)
- Add ellipse tool
- Add line segment tool
- Add point/dot marking tool

### PR #15: Export & Sharing
- Export canvas to PNG
- Export canvas to SVG
- Copy canvas to clipboard
- Share canvas URL with embedded state

---

## Estimated Timeline

**MVP Implementation:** 3-5 days
- PR #1-2: 1 day (Setup & infrastructure)
- PR #3-5: 1-2 days (Core rendering)
- PR #6-8: 1 day (Integration)
- PR #9-10: 0.5-1 day (Polish & testing)

**Post-MVP Features:** 5-7 days (as needed)

---

## Success Metrics

- ✅ All 5 tool types render accurately
- ✅ LLM tool calls are reliable (>95% success rate)
- ✅ Canvas updates in <100ms
- ✅ No crashes on invalid input
- ✅ Works on Chrome, Firefox, Safari
- ✅ Code coverage >80%
- ✅ User feedback is positive

