# Canvas &amp; Whiteboard Tasks

### PR #1: Canvas Component Foundation
**Priority:** P0  
**Day:** 3

**Tasks:**
1. [x] Install Zustand for canvas state management
2. [x] Create canvasStore with initial state (strokes, systemRenders, currentTool, color, isLocked)
3. [x] Create Whiteboard component with Canvas element
4. [x] Set up canvas context and sizing
5. [x] Implement basic coordinate system
6. [x] Integrate Zustand store for drawing state management
7. [x] Add canvas to main layout (split view with chat)
8. [x] Test canvas renders correctly
9. [x] Make canvas responsive to window resizing

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
1. [x] Define tool schemas for canvas rendering (render_equation, render_label, render_diagram, clear_canvas)
2. [x] Update backend to use tool calling with Vercel AI SDK (manual SSE streaming with fullStream)
3. [x] Refactor parseAIStream as a simple wrapper that delegates based on stream structure:
   - [x] Create parseAIStreamText - handles plain text streaming (existing functionality)
   - [x] Create parseAIStreamRender - handles data stream with tool calls (new functionality)
   - [x] Update parseAIStream to detect stream type and delegate to appropriate function
   - [x] parseAIStreamRender extracts tool calls from data stream format
   - [x] parseAIStreamRender accumulates text chunks AND tool calls separately
   - [x] Both functions maintain same callback signature for compatibility
4. [x] Create LaTeX-to-Canvas rendering utility (`latexToCanvas.js`):
   - [x] Use KaTeX (already installed) to render LaTeX to HTML string
   - [x] Convert KaTeX HTML output to canvas image (canvas-based text rendering with styling)
   - [x] Handle async rendering (KaTeX rendering + image capture)
   - [x] Return render data: { image: ImageData/HTMLImageElement, width, height, bounds }
   - [x] Support escaping LaTeX special characters
   - [x] Handle rendering errors gracefully

5. [x] Create canvas renderer utility (`canvasRenderer.js`):
   - [x] Main render function: `renderToCanvas(ctx, renderData, position)`
   - [x] Handle different render types via switch statement:
     - `equation`: Use latexToCanvas, draw image at position
     - `label`: Use canvas fillText with styling
     - `diagram`: Draw shapes based on type (line, circle, rectangle, polygon, arrow, parabola)
   - [x] Apply consistent styling (colors, fonts) for system renders
   - [x] Return render bounds for auto-positioning calculations

6. [x] Implement system layer rendering in Whiteboard component:
   - [x] Iterate through systemRenders from canvasStore
   - [x] For each render, call canvasRenderer with appropriate type
   - [x] Render system layer before user strokes (background layer)
   - [x] Handle async LaTeX rendering (equations may load after initial render)

7. [x] Position elements clearly on canvas (auto-positioning with optional manual coordinates):
   - [x] Auto-positioning logic: track last render position, stack vertically
   - [x] Default spacing: 20px vertical, 50px horizontal margin
   - [x] If coordinates provided in tool call, use those instead
   - [x] Calculate bounds for each render to avoid overlaps
   - [x] Reset position tracker on clear_canvas

8. [x] Clear previous step when new step renders (via clear_canvas tool):
   - [x] When clear_canvas tool is called, call canvasStore.clearSystemRenders()
   - [x] Trigger step creation in canvasStore (for step tracking)
   - [x] Reset auto-positioning tracker

9. [x] Extract tool calls from stream and send to canvas store:
   - [x] In Chat.jsx, extract toolCalls array from parseAIStreamRender completion
   - [x] Process tool calls in order:
     - `clear_canvas` → canvasStore.clearSystemRenders() + create new step
     - `render_equation` → canvasStore.addSystemRender({ type: 'equation', ... })
     - `render_label` → canvasStore.addSystemRender({ type: 'label', ... })
     - `render_diagram` → canvasStore.addSystemRender({ type: 'diagram', ... })
   - [x] Map tool call args to canvasStore render format
   - [x] Generate unique IDs for each render
   - [x] Add validation for tool call arguments and diagram types

10. [x] Canvas hide/show functionality with smooth animations:
    - [x] Add toggle button with eye icon (outline style, low profile)
    - [x] Canvas hidden by default, auto-shows when AI draws
    - [x] Smooth slide animation (0.3s cubic-bezier for optimal performance)
    - [x] Layout: 65% canvas / 35% chat when visible, chat centered at 50% max-width when hidden
    - [x] Fixed positioning for toggle button to prevent jitter
    - [x] Use `willChange` CSS hint for smooth flex animations without layout thrashing

11. [x] Test rendering various equation types:
    - [x] Simple equations: Tested with basic LaTeX
    - [x] Fractions: Supported via KaTeX rendering
    - [x] Exponents: Supported via KaTeX rendering
    - [x] Complex: Tested with quadratic formula
    - [x] Multi-line equations: Supported by KaTeX
    - [x] Greek letters and special symbols: Supported by KaTeX

12. [x] Test rendering diagrams (lines, circles, shapes):
    - [x] Lines: Implemented with two points
    - [x] Circles: Implemented with center + radius point
    - [x] Rectangles: Implemented with top-left + bottom-right
    - [x] Polygons: Implemented with multiple vertices
    - [x] Arrows: Implemented with arrowhead at 15px length
    - [x] Parabolas: Implemented with quadratic curve smoothing
    - [x] Customizable colors and stroke widths via tool arguments

13. [x] Add visual distinction for system-rendered content:
    - [x] Equations: Blue (#2563EB) with light blue background (rgba(219, 234, 254, 0.3))
    - [x] Labels: Gray (#64748B) with white background and subtle border
    - [x] Diagrams: Dark blue stroke (#1E40AF) with 90% opacity and 2.5px stroke width
    - [x] User drawings: Black strokes (default) - clearly distinct from system blue renders
    - [x] Visual layering: System renders draw before user strokes (background layer)

**Acceptance Criteria:**
- ✅ Text streams immediately (no delay from tool calling)
- ✅ Tool calls are extracted from stream and processed after text completion
- ✅ System renders equations on canvas automatically via tool calls
- ✅ LaTeX equations display correctly on canvas
- ✅ Labels and annotations render clearly
- ✅ Diagrams render correctly (lines, circles, rectangles, polygons, arrows, parabolas)
- ✅ Each step clears previous step appropriately (via clear_canvas tool)
- ✅ Multiple equation types render correctly (fractions, exponents, etc.)
- ✅ System-rendered content is visually distinct from user drawings
- ✅ Canvas updates happen smoothly without blocking text streaming
- ✅ Canvas can be hidden/shown with smooth animations
- ⚠️ AI sometimes stops after calling tools without text response (mitigated via few-shot prompting)

**Implementation Notes:**

**Streaming Architecture:**
- Backend uses Vercel AI SDK v5 `streamText` with manual SSE piping via `fullStream`
- Tool schemas defined with Zod for runtime validation
- Frontend parser (`parseAIStreamRender`) handles SSE events and extracts tool calls
- Separate parsers for text-only vs. tool-enabled streams

**Visual Distinction Strategy:**
- Equations: Blue (#2563EB) with subtle light blue background
- Labels: Gray (#64748B) with white background and border
- Diagrams: Dark blue (#1E40AF) with 90% opacity
- User strokes: Black (unchanged) - clearly distinct from system renders
- System renders on background layer (drawn before user strokes)

**Animation Optimization:**
- Used `cubic-bezier(0.4, 0.0, 0.2, 1)` easing for smooth resizing
- Added `willChange: 'flex'` CSS hint to prevent layout thrashing
- 0.3s transition duration for optimal perceived performance
- Fixed positioning for toggle button to prevent jitter during animations

**AI Tool Calling - Known Issues & Solutions:**
- **Issue:** AI sometimes calls tools and stops without text response (finishReason: 'stop' with no text)
- **Root Cause:** Model behavior or SDK configuration with `maxSteps`
- **Solution Implemented:** Few-shot prompting with concrete examples showing tool → text pattern
- **Monitoring:** Added `onFinish` callback for diagnostics (logs when tools called but no text)
- **Status:** Improved with prompting but not 100% reliable; consider future code-level solution

**Tool Call Argument Handling:**
- AI SDK sends tool args via both `event.args` and `event.input` fields
- Parser checks both fields for compatibility across SDK versions
- Validation added in Chat.jsx to prevent crashes from malformed tool calls
- Added 'parabola' as supported diagram type (uses quadraticCurveTo for smooth curves)

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
api/routes/chat.js (added Zod tool schemas, manual SSE streaming with fullStream, onFinish callback)
api/services/promptService.js (added whiteboard tool instructions with few-shot examples)
api/package.json (added zod ^3.23.8 dependency)
frontend/src/services/api.js (refactored parseAIStream, created parseAIStreamText & parseAIStreamRender)
frontend/src/utils/canvasRenderer.js (NEW - renders equations, labels, diagrams with visual distinction)
frontend/src/utils/latexToCanvas.js (NEW - KaTeX to canvas with styled text rendering)
frontend/src/components/Whiteboard.jsx (system layer rendering with useEffect for systemRenders)
frontend/src/components/Chat.jsx (tool call extraction, validation, and canvas store updates)
frontend/src/App.jsx (added canvas hide/show toggle with smooth animations, responsive layout)
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
1. [x] Implement drawing locked/unlocked state in canvasStore
2. [x] Show visual indicator when drawing is locked (LockIndicator component)
3. [x] Lock drawing by default at conversation start (isLocked: true)
4. [x] Unlock drawing after system renders step visualization (unlockAfterRender)
5. [x] Lock drawing when progressing to next step (lockForNextStep on clear_canvas)
6. [x] Disable pointer events when locked (cursor: 'not-allowed', touchAction: 'none')
7. [x] Implement step tracking foundation (steps array, createStep, updateCurrentStepRenders)

**Acceptance Criteria:**
- ✅ Drawing starts locked (isLocked: true by default)
- ✅ Unlocks after system renders visualization (unlockAfterRender called after tool calls)
- ✅ Locks when moving to next step (lockForNextStep on clear_canvas)
- ✅ Visual indicator clearly shows lock state (LockIndicator with lock icon + message)
- ✅ Pointer events disabled when locked (cursor + touchAction in Whiteboard.jsx)
- ✅ Step tracking implemented (createStep, steps array, currentStepIndex)
- ⏳ Flow test through multi-step problem (pending - needs drawing tools)

**Files Created/Modified:**
```
frontend/src/stores/canvasStore.js (added step tracking: steps, currentStepIndex, createStep, unlockAfterRender, lockForNextStep)
frontend/src/components/Whiteboard.jsx (already using isLocked for cursor/touchAction)
frontend/src/components/LockIndicator.jsx (NEW - visual lock indicator with icon)
frontend/src/components/Chat.jsx (integrated lock/unlock flow, step tracking on tool calls)
frontend/src/App.jsx (added LockIndicator, isLocked state from store)
```

**Step Tracking Foundation (for future navigation):**

**Tasks:**
1. [x] Add step tracking state to canvasStore (steps array, currentStepIndex)
2. [x] Create step data structure: { stepNumber, messageId, systemRenders, timestamp, userStrokesSnapshot }
3. [x] When clear_canvas tool is called, create new step snapshot
4. [x] Store step snapshots in canvasStore.steps array
5. [x] Update currentStepIndex when new step is created
6. [x] Ensure step data is serializable for future persistence
7. [x] Canvas visibility controlled by store (shouldShowCanvas event-driven)
8. [x] Canvas preserved when hidden (always mounted, uses visibility CSS)
9. [x] Fallback "Done!" message when AI calls tools without text
10. [x] Canvas clears on conversation delete
- [ ] Update step's systemRenders as renders are added (needs refactor - currently using global systemRenders)
- [ ] Snapshot user strokes per step (pending - needs drawing tools from PR #4)

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

### PR #4: Step Navigation with Arrow Keys
**Priority:** P0  
**Day:** 3

**Phase 1: Navigation UI and Controls**

**Tasks:**
1. [x] Implement navigation actions in canvasStore (goToStep, goToNextStep, goToPreviousStep)
2. [x] Add left/right arrow buttons to Whiteboard component UI
3. [x] Handle keyboard events for left/right arrows (global event listener with preventDefault/stopPropagation)
4. [x] When navigating, update canvas with systemRenders from selected step
5. [x] Disable navigation buttons when at first or last step
6. [x] Refactor step architecture (steps as arrays, currentStepIndex starts at 0, clearCanvas as step type)
7. [x] Add StepType enum for render types (EQUATION, LABEL, DIAGRAM, CLEAR_CANVAS)
8. [x] Add AIToolName enum for tool calls (CLEAR_CANVAS, RENDER_EQUATION, RENDER_LABEL, RENDER_DIAGRAM)
9. [x] Update all render functions to use new step architecture (addRenderToCurrentStep, addClearCanvasStep)
10. [x] Track messageId to detect new AI requests and create new steps

**Acceptance Criteria:**
- ✅ Arrow keys and buttons allow navigating between AI-generated steps
- ✅ Canvas updates to show renders from selected step
- ✅ Navigation disabled at bounds (buttons disabled + keyboard shortcuts blocked)
- ✅ Smooth transitions between steps (systemRenders mirrors steps[currentStepIndex])
- ✅ clearCanvas steps preserved in history for navigation
- ✅ Steps start at index 0 (not -1)
- ✅ All renders from single AI request go into same step
- ✅ Each new AI request creates new step
- ⏳ Test navigation through multi-step conversations (pending user testing)

**Phase 2: Firestore Persistence for Steps**

**Tasks:**
1. [ ] Add `steps` property to conversation document structure in Firestore (array of step objects)
2. [ ] Create `saveStepsToFirestore` function in chatService.js (background save after step creation)
3. [ ] Integrate step persistence in Chat.jsx (call saveStepsToFirestore after createStep)
4. [ ] Update `loadConversationHistory` to fetch steps array from conversation document
5. [ ] Add `loadStepsFromFirestore` action in canvasStore (loads steps array into local state)
6. [ ] On page refresh, load steps from Firestore and set currentStepIndex to last step
7. [ ] Render systemRenders from selected step when loading from Firestore
8. [ ] Handle empty steps array gracefully (default to empty state)
9. [ ] Test persistence across page refreshes

**Acceptance Criteria:**
- Steps are saved to Firestore conversation document after each step creation
- On page refresh, steps load from Firestore into canvasStore
- User defaults to viewing the last step (most recent visualization)
- Canvas renders correctly with persisted step data
- No data loss on page refresh
- Background saves don't block UI

**Files Created/Modified:**
```
frontend/src/stores/canvasStore.js (add navigation actions, loadStepsFromFirestore action)
frontend/src/components/Whiteboard.jsx (add buttons and keyboard handler)
frontend/src/components/Chat.jsx (integrate step persistence, load steps on mount)
frontend/src/services/chatService.js (add saveStepsToFirestore, update loadConversationHistory)
```

### PR #5: Enhanced Graph Visualizations
**Priority:** P0  
**Day:** 3-4

**Tasks:**
1. [ ] Update render_diagram tool schema to support graph elements (axes, grid, scale)
2. [ ] Add logic in promptService to detect linear equations and instruct AI to use graph mode
3. [ ] Implement graph background rendering in canvasRenderer (axes, optional grid)
4. [ ] Add grid visibility toggle based on shape types (e.g., visible for lines, parabolas)
5. [ ] Ensure AI understands shapes are placed on graph coordinates
6. [ ] Update auto-positioning to respect graph layout
7. [ ] Test with linear equation examples (e.g., y = mx + b rendering as graph with line)

**Acceptance Criteria:**
- Linear equations automatically render on graph canvas
- Grid visible only for relevant shapes (lines, parabolas, etc.)
- Shapes positioned correctly on graph coordinates
- AI consistently uses graph mode for appropriate problems
- Visual distinction maintained for graph elements

**Files Created/Modified:**
```
api/services/promptService.js (update AI instructions for graphs)
api/routes/chat.js (update tool schema if needed)
frontend/src/utils/canvasRenderer.js (add graph rendering)
frontend/src/stores/canvasStore.js (add graph state if needed)
```

### PR #6: Diagram Rendering Fixes and Consistency
**Priority:** P0  
**Day:** 4

**Tasks:**
1. [ ] Review and document current inconsistencies in shape rendering
2. [ ] Standardize styling parameters (stroke width, colors, arrowheads)
3. [ ] Fix specific bugs (e.g., parabola curves, polygon closures, circle radius calculation)
4. [ ] Add validation for tool call arguments (e.g., minimum points per shape)
5. [ ] Implement consistent rendering for all diagram types (line, circle, rectangle, polygon, arrow, parabola)
6. [ ] Add error handling for invalid diagram configurations
7. [ ] Test rendering of each shape type with variations

**Acceptance Criteria:**
- All shapes render consistently and correctly
- No visual glitches (e.g., misaligned arrows, jagged lines)
- Consistent appearance across different diagram types
- Handles edge cases (e.g., zero-radius circle, single-point lines)
- Improved reliability in AI-generated diagrams

**Files Created/Modified:**
```
frontend/src/utils/canvasRenderer.js (fix rendering logic)
api/routes/chat.js (add argument validation)
frontend/src/components/Chat.jsx (handle invalid tool calls)
```