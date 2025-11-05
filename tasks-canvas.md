# Canvas & Whiteboard Tasks

### PR #1: Canvas Component Foundation
**Priority:** P0  
**Day:** 3

**Tasks:**
- [x] Install Zustand for canvas state management
- [x] Create canvasStore with initial state (strokes, systemRenders, currentTool, color, isLocked)
- [x] Create Whiteboard component with Canvas element
- [x] Set up canvas context and sizing
- [x] Implement basic coordinate system
- [x] Integrate Zustand store for drawing state management
- [x] Add canvas to main layout (split view with chat)
- [x] Test canvas renders correctly
- [x] Make canvas responsive to window resizing

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
1. [ ] Define tool schemas for canvas rendering (render_equation, render_label, render_diagram, clear_canvas)
2. [ ] Update backend to use tool calling with Vercel AI SDK (pipeDataStreamToResponse)
3. [ ] Refactor parseAIStream as a simple wrapper that delegates based on stream structure:
   - [ ] Create parseAIStreamText - handles plain text streaming (existing functionality)
   - [ ] Create parseAIStreamRender - handles data stream with tool calls (new functionality)
   - [ ] Update parseAIStream to detect stream type and delegate to appropriate function
   - [ ] parseAIStreamRender extracts tool calls from data stream format
   - [ ] parseAIStreamRender accumulates text chunks AND tool calls separately
   - [ ] Both functions maintain same callback signature for compatibility
4. [ ] Create LaTeX-to-Canvas rendering utility (`latexToCanvas.js`):
   - [ ] Use KaTeX (already installed) to render LaTeX to HTML string
   - [ ] Convert KaTeX HTML output to canvas image (render to temporary element, capture via canvas)
   - [ ] Handle async rendering (KaTeX rendering + image capture)
   - [ ] Return render data: { image: ImageData/HTMLImageElement, width, height, bounds }
   - [ ] Support escaping LaTeX special characters
   - [ ] Handle rendering errors gracefully

5. [ ] Create canvas renderer utility (`canvasRenderer.js`):
   - [ ] Main render function: `renderToCanvas(ctx, renderData, position)`
   - [ ] Handle different render types via switch statement:
     - `equation`: Use latexToCanvas, draw image at position
     - `label`: Use canvas fillText with styling
     - `diagram`: Draw shapes based on type (line, circle, rectangle, polygon, arrow)
   - [ ] Apply consistent styling (colors, fonts) for system renders
   - [ ] Return render bounds for auto-positioning calculations

6. [ ] Implement system layer rendering in Whiteboard component:
   - [ ] Iterate through systemRenders from canvasStore
   - [ ] For each render, call canvasRenderer with appropriate type
   - [ ] Render system layer before user strokes (background layer)
   - [ ] Handle async LaTeX rendering (equations may load after initial render)

7. [ ] Position elements clearly on canvas (auto-positioning with optional manual coordinates):
   - [ ] Auto-positioning logic: track last render position, stack vertically
   - [ ] Default spacing: 20px vertical, 50px horizontal margin
   - [ ] If coordinates provided in tool call, use those instead
   - [ ] Calculate bounds for each render to avoid overlaps
   - [ ] Reset position tracker on clear_canvas

8. [ ] Clear previous step when new step renders (via clear_canvas tool):
   - [ ] When clear_canvas tool is called, call canvasStore.clearSystemRenders()
   - [ ] Trigger step creation in canvasStore (for step tracking)
   - [ ] Reset auto-positioning tracker

9. [ ] Extract tool calls from stream and send to canvas store:
   - [ ] In Chat.jsx, extract toolCalls array from parseAIStreamRender completion
   - [ ] Process tool calls in order:
     - `clear_canvas` → canvasStore.clearSystemRenders() + create new step
     - `render_equation` → canvasStore.addSystemRender({ type: 'equation', ... })
     - `render_label` → canvasStore.addSystemRender({ type: 'label', ... })
     - `render_diagram` → canvasStore.addSystemRender({ type: 'diagram', ... })
   - [ ] Map tool call args to canvasStore render format
   - [ ] Generate unique IDs for each render

10. [ ] Test rendering various equation types:
    - [ ] Simple equations: $x = 5$
    - [ ] Fractions: $\frac{a}{b}$
    - [ ] Exponents: $x^2 + y^3$
    - [ ] Complex: $\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
    - [ ] Multi-line equations
    - [ ] Greek letters and special symbols

11. [ ] Test rendering diagrams (lines, circles, shapes):
    - [ ] Lines: two points
    - [ ] Circles: center + radius point
    - [ ] Rectangles: top-left + bottom-right
    - [ ] Polygons: multiple vertices
    - [ ] Arrows: start + end with arrowhead
    - [ ] Test with different colors and stroke widths

12. [ ] Add visual distinction for system-rendered content:
    - [ ] Use distinct color scheme (e.g., blue for equations, gray for labels)
    - [ ] Add subtle background or border for system renders
    - [ ] Ensure user drawings (black) are clearly different
    - [ ] Consider opacity or styling to distinguish layers

**Acceptance Criteria:**
- Text streams immediately (no delay from tool calling)
- Tool calls are extracted from stream and processed after text completion
- System renders equations on canvas automatically via tool calls
- LaTeX equations display correctly on canvas
- Labels and annotations render clearly
- Diagrams render correctly (lines, circles, rectangles, polygons, arrows)
- Each step clears previous step appropriately (via clear_canvas tool)
- Multiple equation types render correctly (fractions, exponents, etc.)
- System-rendered content is visually distinct from user drawings
- Canvas updates happen smoothly without blocking text streaming

**Tool Schemas:**

```javascript
// Backend tool definitions (api/routes/chat.js)
const canvasTools = {
  render_equation: {
    description: "Render a LaTeX equation on the canvas. Use this when introducing a new step, showing a worked example, or displaying an equation that should be visualized on the whiteboard.",
    parameters: {
      type: "object",
      properties: {
        latex: {
          type: "string",
          description: "LaTeX equation to render (e.g., 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'). Use the same LaTeX format as in chat messages ($...$ not needed here)."
        },
        x: {
          type: "number",
          description: "X position on canvas (0-1000). Optional - if not provided, equations will auto-stack vertically."
        },
        y: {
          type: "number",
          description: "Y position on canvas (0-1000). Optional - if not provided, equations will auto-stack vertically."
        }
      },
      required: ["latex"]
    }
  },
  render_label: {
    description: "Render a text label or annotation on the canvas. Use this for step numbers, instructions, or contextual notes that help explain the visualizations.",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Label text to display (e.g., 'Step 1: Set up the equation')"
        },
        x: {
          type: "number",
          description: "X position on canvas (0-1000). Optional - if not provided, labels will auto-position."
        },
        y: {
          type: "number",
          description: "Y position on canvas (0-1000). Optional - if not provided, labels will auto-position."
        },
        fontSize: {
          type: "number",
          description: "Font size in pixels. Optional - defaults to 14."
        }
      },
      required: ["text"]
    }
  },
  render_diagram: {
    description: "Render a geometric diagram or shape on the canvas. Use this for geometric problems, coordinate systems, graphs, or visual representations of mathematical concepts.",
    parameters: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["line", "circle", "rectangle", "polygon", "arrow"],
          description: "Type of diagram element to render"
        },
        points: {
          type: "array",
          items: {
            type: "object",
            properties: {
              x: { type: "number" },
              y: { type: "number" }
            }
          },
          description: "Array of points defining the shape. For lines: start and end points. For circles: center and point on circumference. For rectangles: top-left and bottom-right. For polygons: all vertices. For arrows: start and end points."
        },
        strokeColor: {
          type: "string",
          description: "Stroke color (e.g., '#000000'). Optional - defaults to black."
        },
        fillColor: {
          type: "string",
          description: "Fill color (e.g., '#FF0000'). Optional - for shapes that should be filled."
        },
        strokeWidth: {
          type: "number",
          description: "Line width in pixels. Optional - defaults to 2."
        }
      },
      required: ["type", "points"]
    }
  },
  clear_canvas: {
    description: "Clear all previous step visualizations from the canvas. Use this at the start of a new problem or when starting a completely new step. This only clears system-rendered content, not user drawings.",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
};
```

**API Response Format:**

```javascript
// Stream format (Vercel AI SDK data stream)
// Text chunks (as before):
data: {"type":"text-delta","textDelta":"Let's"}\n\n
data: {"type":"text-delta","textDelta":" solve"}\n\n

// Tool calls (new):
data: {"type":"tool-call","toolCallId":"call_abc123","toolName":"render_equation","args":{"latex":"x = 5"}}\n\n
data: {"type":"tool-call-delta","toolCallId":"call_abc123","argsDelta":"{\"latex\":\"x = 5\"}"}\n\n

// Stream completion:
data: {"type":"finish","finishReason":"stop"}\n\n
```

**Frontend Parsing Logic:**

```javascript
// Architecture: parseAIStream is a wrapper that delegates to specialized functions

// parseAIStream (wrapper)
// - Detects stream type (text vs data stream)
// - Delegates to parseAIStreamText (existing) or parseAIStreamRender (new)

// parseAIStreamText (existing functionality)
// - Handles plain text streaming
// - Accumulates text chunks
// - Calls onChunk(text) and onComplete(fullText)

// parseAIStreamRender (new functionality)
// - Handles Vercel AI SDK data stream format
// - Parses SSE format: data: {"type":"text-delta","textDelta":"..."}
// - Extracts tool calls: data: {"type":"tool-call",...}
// - Accumulates text chunks separately from tool calls
// - Calls onChunk(text) for text deltas
// - Calls onComplete(fullText, toolCalls) with both text and tool calls array

// Example parsed tool call structure:
{
  toolCallId: "call_abc123",
  toolName: "render_equation",
  args: {
    latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    x: 100,
    y: 150
  }
}
```

**Files Created/Modified:**
```
api/routes/chat.js (add tool definitions, use pipeDataStreamToResponse)
api/services/promptService.js (add brief tool usage instructions)
frontend/src/services/api.js (refactor parseAIStream as wrapper, add parseAIStreamText and parseAIStreamRender)
frontend/src/utils/canvasRenderer.js (NEW - render different types on canvas)
frontend/src/utils/latexToCanvas.js (NEW - convert LaTeX to canvas drawing)
frontend/src/components/Whiteboard.jsx (update to render system renders)
frontend/src/components/Chat.jsx (extract tool calls from stream, send to canvas store)
```

**Technical Notes:**

**LaTeX-to-Canvas Rendering Approach:**
- KaTeX's `katex.renderToString()` returns HTML string with SVG elements
- Approach: Create temporary DOM element → render KaTeX HTML → capture as image → draw to canvas
- Alternative: Use KaTeX's SVG output directly and convert SVG to canvas via drawImage
- Consider using html2canvas library if direct SVG conversion is complex
- Cache rendered equations to avoid re-rendering same LaTeX

**Auto-Positioning Strategy:**
- Track `lastRenderY` position in canvasStore or local state
- Each render increments Y by `renderHeight + spacing`
- Manual coordinates override auto-positioning
- Reset `lastRenderY` to top margin (50px) on clear_canvas

**Render Data Structure in canvasStore:**
```javascript
{
  id: "render-123",
  type: "equation" | "label" | "diagram",
  // For equations:
  latex: "x = 5",
  x?: number, // optional manual position
  y?: number,
  // For labels:
  text: "Step 1",
  fontSize?: number,
  // For diagrams:
  diagramType: "line" | "circle" | ...,
  points: [{x, y}, ...],
  strokeColor?: string,
  fillColor?: string,
  strokeWidth?: number
}
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

**Step Tracking Foundation (for future navigation):**

**Tasks:**
- [ ] Add step tracking state to canvasStore (steps array, currentStepIndex)
- [ ] Create step data structure: { stepNumber, messageId, systemRenders, timestamp, userStrokes? }
- [ ] When clear_canvas tool is called, create new step snapshot
- [ ] When render tools are called, add to current step's systemRenders
- [ ] Store step snapshots in canvasStore.steps array
- [ ] Update currentStepIndex when new step is created
- [ ] Ensure step data is serializable for future persistence

**Step Data Structure:**
```javascript
// In canvasStore.js
{
  steps: [
    {
      stepNumber: 1,
      messageId: "assistant-1234567890", // Link to AI message that created this step
      systemRenders: [
        { id: "render-1", type: "equation", latex: "x = 5", x: 100, y: 150 },
        { id: "render-2", type: "label", text: "Step 1", x: 50, y: 50 }
      ],
      timestamp: Date.now(),
      // Optional: snapshot of user strokes at this step (for future)
      userStrokesSnapshot: []
    },
    // ... more steps
  ],
  currentStepIndex: 0, // Index of currently displayed step
  // ... existing state
}
```

**Implementation Notes:**
- Steps are created when `clear_canvas` tool is called (new step = new problem/step)
- All `render_*` tool calls after a `clear_canvas` belong to that step
- Step snapshots allow future navigation (back/forward buttons in later PR)
- Steps are linked to messages via messageId for correlation
- Step data structure is designed to be persisted to Firestore in future PR

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