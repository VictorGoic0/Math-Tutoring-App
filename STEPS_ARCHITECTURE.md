# Steps Architecture - Canvas Navigation System

## Overview
This document defines the architecture for step-based navigation through canvas visualizations.

## Core Principles

1. **Steps as Render History**: Each step represents a discrete state of the canvas
2. **Clear Canvas is a Step**: Clearing creates a visible step boundary for navigation
3. **Zero-Indexed**: Steps start at index 0, not -1
4. **Simple Structure**: Steps are arrays of render objects, no complex metadata

---

## Current Render Object Structure

Renders are **objects** with different properties based on type:

### Equation Render
```javascript
{
  id: "render-1234567890-0.123",
  type: "equation",
  latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
  x: 100,        // optional - manual position
  y: 150         // optional - manual position
}
```

### Label Render
```javascript
{
  id: "render-1234567890-0.456",
  type: "label",
  text: "Step 1: Set up the equation",
  x: 50,         // optional
  y: 50,         // optional
  fontSize: 14   // optional
}
```

### Diagram Render
```javascript
{
  id: "render-1234567890-0.789",
  type: "diagram",
  diagramType: "line" | "circle" | "rectangle" | "polygon" | "arrow" | "parabola",
  points: [
    { x: 100, y: 200 },
    { x: 300, y: 400 }
  ],
  strokeColor: "#1E40AF",   // optional
  fillColor: "#FF0000",     // optional
  strokeWidth: 2.5          // optional
}
```

### Clear Canvas Step Marker
```javascript
{
  id: "step-1234567890",
  type: "clearCanvas",
  timestamp: Date.now()
}
```

---

## Proposed Steps Architecture

### Step Types Enum
```javascript
const StepType = {
  RENDER: 'render',           // Contains actual visual content
  CLEAR_CANVAS: 'clearCanvas' // Marks a clear boundary (JS naming convention)
};
```

### Steps Array Structure
```javascript
// Example: User asks AI to solve two problems
steps = [
  // Step 0: First problem's visualizations
  [
    { id: "r1", type: "equation", latex: "x^2 + 5x + 6 = 0", ... },
    { id: "r2", type: "label", text: "Step 1: Factor the equation", ... },
    { id: "r3", type: "diagram", diagramType: "parabola", points: [...], ... }
  ],
  
  // Step 1: Clear canvas (boundary marker)
  [
    { id: "s1", type: "clearCanvas", timestamp: 1234567890 }
  ],
  
  // Step 2: Second problem's visualizations
  [
    { id: "r4", type: "equation", latex: "y = 2x + 3", ... },
    { id: "r5", type: "diagram", diagramType: "line", points: [...], ... }
  ]
];
```

### Current Step Index
```javascript
currentStepIndex: 0  // Always starts at 0 (not -1)
```

---

## Behavior Flow

### 1. Initial State
```javascript
{
  steps: [],              // Empty array
  currentStepIndex: 0,    // Start at 0 (no more -1)
  systemRenders: []       // Current visible renders
}
```

### 2. When AI Calls `render_*` Tools (No clear_canvas yet)
- If `steps` is empty: **Auto-create step 0 as empty array**
- Add render object to `steps[currentStepIndex]`
- Update `systemRenders` to match `steps[currentStepIndex]`

Example:
```javascript
// AI calls: render_equation, render_label
steps = [
  [
    { type: "equation", latex: "x = 5", ... },
    { type: "label", text: "Solved!", ... }
  ]
];
currentStepIndex = 0;
systemRenders = steps[0]; // Array with 2 renders
```

### 3. When AI Calls `clear_canvas`
- Create a new step with a clear marker: `[{ type: "clearCanvas", ... }]`
- Increment `currentStepIndex` to point to the new step
- Clear `systemRenders` (visual clear)

Example:
```javascript
// AI calls: clear_canvas
steps = [
  [{ type: "equation", ... }, { type: "label", ... }],  // Step 0: previous renders
  [{ type: "clearCanvas", timestamp: Date.now() }]     // Step 1: clear marker
];
currentStepIndex = 1;
systemRenders = []; // Canvas is visually cleared
```

### 4. When AI Adds More Renders After Clear
- Add renders to the **current step** (which contains the clear marker)
- **Keep the clear marker and append renders**

```javascript
steps = [
  [{ type: "equation", ... }],                           // Step 0
  [
    { type: "clearCanvas", timestamp: 123 },             // Step 1: clear marker preserved
    { type: "equation", ... }                            // New render after clear
  ]
];
```

**Why keep clearCanvas marker:**
- Users can navigate back and see the clear boundary
- Clear state is preserved in history
- More intuitive for reviewing work step-by-step

---

## Navigation Behavior

### Rendering a Step
When navigating to a step via arrow keys or buttons:

1. Get the step: `const step = steps[targetIndex]`
2. Check step type:
   - **If step contains `clear_canvas`**: Clear canvas (show blank)
   - **If step contains renders**: Render all objects in the step array

```javascript
function renderStep(index) {
  const step = steps[index];
  
  // Check if this is a clear step
  const isClearStep = step.some(r => r.type === 'clearCanvas');
  
  if (isClearStep) {
    // Show blank canvas
    systemRenders = [];
  } else {
    // Render all objects in this step
    systemRenders = [...step];
  }
  
  currentStepIndex = index;
}
```

### Arrow Key Navigation
- **Left Arrow**: `goToPreviousStep()` → `currentStepIndex = Math.max(0, currentStepIndex - 1)`
- **Right Arrow**: `goToNextStep()` → `currentStepIndex = Math.min(steps.length - 1, currentStepIndex + 1)`

### Button Visibility
- Show buttons when: `steps.length > 1`
- Previous button disabled when: `currentStepIndex === 0`
- Next button disabled when: `currentStepIndex === steps.length - 1`

---

## Example Walkthrough

### Scenario: User asks AI to solve two problems

**1. Initial state**
```javascript
steps = [];
currentStepIndex = 0;
systemRenders = [];
```

**2. AI responds to first problem (renders equation)**
```javascript
// Tool calls: render_equation({ latex: "x^2 = 16" })
// Auto-create step 0 since steps is empty
steps = [
  [{ id: "r1", type: "equation", latex: "x^2 = 16" }]
];
currentStepIndex = 0;
systemRenders = [{ type: "equation", latex: "x^2 = 16" }];
// Canvas shows: equation
// Buttons: Not visible (only 1 step)
```

**3. User asks second problem, AI calls clear_canvas**
```javascript
// Tool calls: clear_canvas
steps = [
  [{ type: "equation", latex: "x^2 = 16" }],          // Step 0
  [{ type: "clearCanvas", timestamp: 1234567890 }]   // Step 1 (clear marker)
];
currentStepIndex = 1;
systemRenders = [];
// Canvas shows: blank
// Buttons: NOW VISIBLE (2 steps)
// Can press Left Arrow to go back to step 0
```

**4. AI renders second problem's equation**
```javascript
// Tool calls: render_equation({ latex: "y = 2x + 3" })
// Append render to step 1 (keep clear marker)
steps = [
  [{ type: "equation", latex: "x^2 = 16" }],       // Step 0
  [
    { type: "clearCanvas", timestamp: 1234567890 }, // Step 1 (clear marker kept)
    { type: "equation", latex: "y = 2x + 3" }      // New render appended
  ]
];
currentStepIndex = 1;
systemRenders = [
  { type: "clearCanvas", timestamp: 1234567890 },
  { type: "equation", latex: "y = 2x + 3" }
];
// Canvas shows: blank (from clearCanvas) then new equation
// Buttons: Visible, can navigate between step 0 and step 1
```

**5. User presses Left Arrow**
```javascript
// goToPreviousStep() called
currentStepIndex = 0;
systemRenders = steps[0]; // [{ type: "equation", latex: "x^2 = 16" }]
// Canvas shows: first equation again
```

---

## Key Decisions to Make

### Q1: When AI adds multiple renders to same response, how are they grouped?
**Answer**: All renders from a single AI response (before any `clear_canvas`) go into the same step array.

### Q2: What happens with multiple AI requests without `clear_canvas`?
**Answer**: Each AI request/response creates a NEW step. All renders from ONE request go into the same step array. If the user asks another question and the AI responds (new request), those renders go into a new step automatically.

**Implementation**: Track AI message IDs. When processing tool calls, if the messageId is different from the last step's messageId, auto-create a new step.

### Q3: Should we show the "clear canvas" step as a blank screen when navigating?
**Answer**: **Yes (Option A)** - User can navigate to clearCanvas steps and see a blank canvas. This provides visual clarity for step boundaries.

### Q4: When the first renders are added, should we auto-create step 0?
**Answer**: Yes. If `steps` is empty and a render is added, auto-create `steps[0] = []` and add render to it.

---

## Implementation Checklist

### Core Store Changes (canvasStore.js)
- [ ] Change `currentStepIndex` default from -1 to 0
- [ ] Change `steps` from array of complex objects to array of arrays
- [ ] Add `lastMessageId` tracking to detect new AI requests
- [ ] Remove `createStep()` function (no longer needed)
- [ ] Remove `updateCurrentStepRenders()` function (no longer needed)
- [ ] Remove `syncCurrentStepRenders()` function (no longer needed)
- [ ] Add `addRenderToCurrentStep(render, messageId)` function that:
  - Auto-creates step 0 if `steps` is empty
  - Detects new AI request (different messageId) and creates new step
  - Adds render to current step array (appends to existing renders)
  - Updates `systemRenders` to match `steps[currentStepIndex]`
- [ ] Add `addClearCanvasStep(messageId)` function that:
  - Creates new step with `[{ type: "clearCanvas", timestamp: Date.now() }]`
  - Increments `currentStepIndex`
  - Sets `systemRenders` to `[{ type: "clearCanvas", timestamp: Date.now() }]`
  - Updates `lastMessageId` to track this request
- [ ] Update `goToStep(index)` to handle new structure:
  - Check if step contains `clearCanvas` type
  - Set `systemRenders` to empty array or step renders accordingly
- [ ] Update `goToNextStep()` and `goToPreviousStep()` (likely no changes needed)
- [ ] Remove `clearAll()` or update to reset to initial state with `currentStepIndex: 0`

### Chat Component Changes (Chat.jsx)
- [ ] Remove `createStep()` call from `clear_canvas` tool processing
- [ ] Replace with `addClearCanvasStep(aiMessageId)` call
- [ ] For `render_*` tools, replace `addSystemRender()` with `addRenderToCurrentStep(render, aiMessageId)`
- [ ] Remove `syncCurrentStepRenders()` call (no longer needed)
- [ ] Pass `aiMessageId` to all render functions

### Whiteboard Component Changes (Whiteboard.jsx)
- [ ] No changes needed (already uses selectors correctly)
- [ ] Verify navigation buttons show when `steps.length > 1`
- [ ] Verify arrow key handlers work with new structure

### Testing Checklist
- [ ] Test: First render creates step 0 automatically
- [ ] Test: Multiple renders in same AI response go to same step
- [ ] Test: New AI request creates new step (even without clear_canvas)
- [ ] Test: clear_canvas creates a clearCanvas step
- [ ] Test: Navigating to clearCanvas step shows blank canvas
- [ ] Test: Arrow keys navigate between steps
- [ ] Test: Buttons appear when 2+ steps exist
- [ ] Test: currentStepIndex never goes below 0
- [ ] Test: Buttons disabled at bounds correctly

## Questions & Clarifications

### Q: When AI adds renders after a clearCanvas step, do we replace or append?
**Answer**: Keep clearCanvas marker and append renders (Option 2).

```javascript
// Step starts with clear marker
[{ type: "clearCanvas", timestamp: 123 }]

// After renders are added, KEEP the clear marker
[
  { type: "clearCanvas", timestamp: 123 },
  { type: "equation", latex: "..." },
  { type: "label", text: "..." }
]
```

**Why**: Users can navigate back to see the clear boundary in history. The clearCanvas marker provides visual context when reviewing steps.

### Q: What if user asks multiple questions rapidly without clear_canvas?
Example:
- User: "Solve x^2 = 16" → AI renders equation (step 0)
- User: "Now solve y = 2x + 3" → AI renders equation (step 1? or append to step 0?)

**Answer from Q2**: New AI request = new step. So step 1 would be created.

**Implementation**: Track messageId. When messageId changes, it's a new request → new step.

### Q: Should systemRenders always match steps[currentStepIndex]?
**Answer**: Yes. `steps` is the source of truth, `systemRenders` mirrors the current step.

**Data flow:**
- `steps` = **source of truth** (permanent history/record)
- `systemRenders` = **view of current step** (what's displayed on canvas)
- `systemRenders` always mirrors `steps[currentStepIndex]`

**When navigating:**
```javascript
goToStep(index) {
  currentStepIndex = index;
  systemRenders = [...steps[index]]; // Mirror the step
}
```

**When adding renders:**
```javascript
addRenderToCurrentStep(render) {
  steps[currentStepIndex].push(render);        // Update source of truth
  systemRenders = [...steps[currentStepIndex]]; // Sync view to match
}
```

**Summary**: `steps` is the permanent record, `systemRenders` is just what's currently displayed. They stay in sync.

