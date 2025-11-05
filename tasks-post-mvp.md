# Post-MVP Canvas Features

## PR #1: Undo/Redo for Whiteboard
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

## PR #2: Text Tool for Math Notations
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

## PR #3: Shape Tool
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

## PR #4: Line/Arrow Tool
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

## PR #5: Highlighter Tool
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

## PR #6: Interactive Whiteboard Enhancement
**Priority:** Post-MVP
**Day:** 3-4 (after previous canvas PRs)

**Tasks:**
- [ ] Add pan and zoom functionality
- [ ] Implement touch support for tablets
- [ ] Add undo/redo for drawings
- [ ] Improve drawing smoothness (line smoothing algorithm)
- [ ] Add highlighter tool (semi-transparent)
- [ ] Add shape tools (line, circle, rectangle) - optional
- [ ] Test on different devices

**Acceptance Criteria:**
- Pan and zoom work smoothly
- Touch drawing works on tablets
- Undo/redo work correctly (up to 20 steps)
- Drawing feels very smooth
- Highlighter tool works with transparency
- All tools tested on desktop and tablet

**Files Created/Modified:**
```
frontend/src/hooks/useCanvasZoom.js
frontend/src/utils/lineSmoothing.js
frontend/src/hooks/useDrawingHistory.js
```

## PR #7: Advanced Image Parsing (Handwritten)
**Priority:** Post-MVP
**Day:** 2-3 (after image-related PRs)

**Tasks:**
- [ ] Test Vision API with handwritten math problems
- [ ] Improve prompt for better handwriting recognition
- [ ] Add confidence scores for parsed text
- [ ] Allow user to correct parsed text before starting
- [ ] Test with various handwriting styles
- [ ] Document handwriting recognition limitations

**Acceptance Criteria:**
- Handwritten problems parse with >70% accuracy
- User can edit parsed text before confirming
- Clear messaging when confidence is low
- Documentation notes which handwriting styles work best

**Files Created/Modified:**
```
backend/services/visionService.js (update)
frontend/src/components/ParsedProblemConfirmation.jsx
```

## PR #8: Voice Interface (TTS + STT)
**Priority:** Post-MVP
**Day:** 4-5 (only after whiteboard + step viz are polished)

**Tasks:**
- [ ] Install Web Speech API (browser native)
- [ ] Implement Text-to-Speech for tutor responses
- [ ] Implement Speech-to-Text for student input
- [ ] Add microphone button UI
- [ ] Add speaker toggle button UI
- [ ] Implement voice activity indicator (waveform or pulsing)
- [ ] Handle browser compatibility (feature detection)
- [ ] Add error handling for voice failures
- [ ] Test on multiple browsers
- [ ] Fallback to text-only if voice not supported

**Acceptance Criteria:**
- TTS reads tutor responses aloud
- STT captures student speech and converts to text
- Microphone button starts/stops listening
- Speaker button enables/disables TTS
- Visual feedback shows when voice is active
- Works on Chrome, Firefox, Safari, Edge
- Graceful fallback when voice not supported
- Error messages help user troubleshoot

**Files Created/Modified:**
```
frontend/src/components/VoiceControls.jsx
frontend/src/hooks/useTextToSpeech.js
frontend/src/hooks/useSpeechToText.js
frontend/src/utils/voiceFeatureDetection.js
```
