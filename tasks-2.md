# Post-MVP Features for Canvas

These PRs enhance the whiteboard after core MVP is complete. They build on the Zustand canvasStore from PRs 9-14.

## PR #22: Undo/Redo for Whiteboard
**Priority:** Post-MVP  

**Tasks:**
- [ ] Add undo/redo actions to canvasStore (maintain history stack of strokes)
- [ ] Add undo/redo buttons to DrawingTools UI
- [ ] Limit history to 20 steps to prevent memory issues
- [ ] Test undo/redo with multiple strokes

**Acceptance Criteria:**
- Undo reverses last user action
- Redo reapplies undone actions
- Works with freehand drawing
- No impact on system layer

**Files Created/Modified:**
```
frontend/src/stores/canvasStore.js  // Add undo/redo logic
frontend/src/components/DrawingTools.jsx  // Add buttons
```

## PR #23: Text Tool for Math Notations
**Priority:** Post-MVP  

**Tasks:**
- [ ] Add text tool to DrawingTools selector
- [ ] Create tool panel with common math notations (pi, e, sigma, etc.)
- [ ] Implement text placement on canvas (click to place, type notation)
- [ ] Add text to strokes array in canvasStore
- [ ] Support basic formatting (size, color)

**Acceptance Criteria:**
- User can select and place math notations on canvas
- Notations render correctly (integrate with KaTeX if needed)
- Text can be erased/undone like other strokes

**Files Created/Modified:**
```
frontend/src/components/DrawingTools.jsx  // Add text tool and panel
frontend/src/stores/canvasStore.js  // Support text in strokes
frontend/src/utils/canvasRenderer.js  // Render text
```

## PR #24: Shape Tool
**Priority:** Post-MVP  

**Tasks:**
- [ ] Add shape tool to selector (circle, rectangle, triangle)
- [ ] Implement drag-to-draw shapes
- [ ] Add shapes to strokes array in canvasStore
- [ ] Support fill/stroke color from color picker

**Acceptance Criteria:**
- User can draw basic shapes on canvas
- Shapes can be erased/undone
- Integrates with existing tools

**Files Created/Modified:**
```
frontend/src/components/DrawingTools.jsx  // Add shape tool
frontend/src/stores/canvasStore.js  // Support shapes
frontend/src/utils/drawingEngine.js  // Shape drawing logic
```

## PR #25: Line/Arrow Tool
**Priority:** Post-MVP  

**Tasks:**
- [ ] Add line/arrow tool to selector
- [ ] Implement drag-to-draw straight lines/arrows
- [ ] Add to strokes array in canvasStore
- [ ] Support arrowheads and line styles

**Acceptance Criteria:**
- User can draw lines and arrows for annotations
- Can be erased/undone
- Useful for geometry labeling

**Files Created/Modified:**
```
frontend/src/components/DrawingTools.jsx  // Add line tool
frontend/src/stores/canvasStore.js  // Support lines
frontend/src/utils/drawingEngine.js  // Line drawing logic
```

## PR #26: Highlighter Tool
**Priority:** Post-MVP  

**Tasks:**
- [ ] Add highlighter tool to selector
- [ ] Implement semi-transparent wide strokes
- [ ] Add to strokes array in canvasStore
- [ ] Support color picker for highlight color

**Acceptance Criteria:**
- Highlighter emphasizes parts of visualizations
- Semi-transparent (doesn't obscure content)
- Can be erased/undone

**Files Created/Modified:**
```
frontend/src/components/DrawingTools.jsx  // Add highlighter
frontend/src/stores/canvasStore.js  // Support highlighter strokes
frontend/src/utils/drawingEngine.js  // Transparent drawing
```
