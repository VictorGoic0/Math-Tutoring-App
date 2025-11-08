# MathTutor AI - Canvas Graph Rendering System
## Technical Design Document (TDD)

**Version:** 2.0  
**Date:** November 8, 2025  
**Author:** Technical Architecture  
**Status:** Ready for Implementation

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Tool Definitions (OpenAI Function Calling)](#tool-definitions)
4. [Frontend Components](#frontend-components)
5. [State Management (Zustand)](#state-management)
6. [Math Rendering Engine](#math-rendering-engine)
7. [Coordinate System & Transformations](#coordinate-system--transformations)
8. [Implementation Guide](#implementation-guide)
9. [Task Breakdown](#task-breakdown)
10. [Code Examples](#code-examples)

---

## Executive Summary

### Objectives
- Replace unreliable LLM-drawn graphics with deterministic, programmatic rendering
- Implement minimal tool calls for equations (linear, quadratic) and shapes (circle, square, triangle)
- LLM provides ONLY equations/coordinates; frontend handles ALL rendering logic
- Use Zustand for centralized state management
- Fixed bounds (-10 to +10) for MVP - no zoom/pan complexity

### Key Design Decisions
1. **LLM Simplicity** - LLM only outputs equations or coordinate points, nothing else
2. **Frontend-controlled styling** - All colors, line widths, rendering decisions made by frontend
3. **Fixed coordinate bounds** - Standard 4-quadrant grid (-10 to +10) for MVP
4. **Zustand state management** - Centralized store for all canvas state
5. **Three-layer canvas architecture** - Grid (static) → System Renders (AI) → User Drawings
6. **math.js for equation parsing** - Handles arbitrary mathematical expressions safely

### Success Metrics
- ✅ 100% accurate coordinate plotting for all supported equation types
- ✅ Zero latency for graph rendering (no API calls)
- ✅ Deterministic shape drawing (circle always renders as circle)
- ✅ LLM tool calls are minimal and consistent
- ✅ Persistent grid with fixed bounds (-10 to +10)

---

## System Architecture

### High-Level Flow

```
┌─────────────┐
│   Student   │
│   Message   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  OpenAI Chat Completion (Streaming)     │
│  - Socratic tutoring text response      │
│  - Tool calls (structured shapes/graphs)│
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend Parser                        │
│  - Extract tool calls from stream       │
│  - Validate parameters                  │
│  - Queue render commands                │
└──────┬──────────────────────────────────┘
       │
       ├─── Text ───────────────────────────────────┐
       │                                            ▼
       │                                    ┌──────────────┐
       │                                    │  Chat UI     │
       │                                    │  (Messages)  │
       │                                    └──────────────┘
       │
       └─── Tool Calls ────────────────────────────┐
                                                    ▼
                                            ┌──────────────────────┐
                                            │  Canvas Controller   │
                                            │  - Parse equation    │
                                            │  - Calculate coords  │
                                            │  - Render on canvas  │
                                            └──────────────────────┘
                                                    │
                       ┌────────────────────────────┼─────────────────────────────┐
                       ▼                            ▼                             ▼
              ┌────────────────┐         ┌──────────────────┐        ┌──────────────────┐
              │  Grid Layer    │         │  System Layer    │        │   User Layer     │
              │  (Static)      │         │  (AI-rendered)   │        │  (Free Drawing)  │
              │  - Axes        │         │  - Equations     │        │  - Pen strokes   │
              │  - Tick marks  │         │  - Shapes        │        │  - Annotations   │
              │  - Grid lines  │         │  - Points        │        │  - Highlights    │
              └────────────────┘         └──────────────────┘        └──────────────────┘
```

### Tech Stack
- **Frontend:** React 18+ with Hooks
- **Math Library:** math.js v12+ (frontend only)
- **Canvas:** HTML5 Canvas API (2D context)
- **AI Integration:** OpenAI API via Vercel AI SDK
- **State Management:** Zustand (centralized store)

### Coordinate System
- **Fixed Bounds:** -10 to +10 on both X and Y axes (4-quadrant Cartesian plane)
- **No zoom/pan for MVP** - Simplified scope
- **Canvas size:** Responsive, but coordinate space remains fixed

---

## Tool Definitions

### Design Philosophy
LLM provides **ONLY the minimal data needed** - equations or coordinate points. All rendering logic, styling, colors, and calculations happen on the frontend.

**Tool Set:**
- `draw_linear_function` - Equation only (e.g., "2*x + 3")
- `draw_quadratic_function` - Equation only (e.g., "x^2 - 4")
- `draw_circle` - Center point + radius
- `draw_square` - Four corner coordinates
- `draw_triangle` - Three vertex coordinates

**LLM communicates bounds in prompt:**
- System prompt informs LLM that coordinate plane is **-10 to +10 on both axes**
- LLM should provide coordinates within these bounds
- Frontend will clip/warn if coordinates are out of bounds

---

### Tool 1: `draw_linear_function`

**Purpose:** Draw a straight line given a linear equation

**LLM provides:** Equation string only  
**Frontend decides:** Color (blue for system), line width (2px), all rendering logic

```json
{
  "type": "function",
  "function": {
    "name": "draw_linear_function",
    "description": "Draw a linear function (straight line) on the coordinate plane. The plane spans from -10 to +10 on both axes. Provide ONLY the equation in terms of x. Examples: '2*x + 3', '-0.5*x + 1', 'x/2 - 4'. Do NOT specify colors, labels, or rendering options.",
    "parameters": {
      "type": "object",
      "properties": {
        "equation": {
          "type": "string",
          "description": "Linear equation in terms of x. Use standard math.js syntax. Examples: '2*x + 3', '-x/2 + 5', '0.5*x - 1'"
        }
      },
      "required": ["equation"]
    }
  }
}
```

**Example Tool Call:**
```json
{
  "name": "draw_linear_function",
  "arguments": {
    "equation": "2*x + 3"
  }
}
```

**Frontend Rendering Logic:**
```javascript
// Frontend constants (not from LLM)
const SYSTEM_COLOR = '#2563eb'; // Blue
const SYSTEM_LINE_WIDTH = 2;

function renderLinearFunction(ctx, { equation }, bounds) {
  const expr = compile(equation);
  
  // Calculate endpoints using fixed bounds
  const x1 = bounds.xMin; // -10
  const y1 = expr.evaluate({ x: x1 });
  const x2 = bounds.xMax; // +10
  const y2 = expr.evaluate({ x: x2 });
  
  // Draw line with frontend-controlled styling
  ctx.strokeStyle = SYSTEM_COLOR;
  ctx.lineWidth = SYSTEM_LINE_WIDTH;
  ctx.beginPath();
  const [cx1, cy1] = worldToCanvas(x1, y1, bounds);
  const [cx2, cy2] = worldToCanvas(x2, y2, bounds);
  ctx.moveTo(cx1, cy1);
  ctx.lineTo(cx2, cy2);
  ctx.stroke();
}
```

---

### Tool 2: `draw_quadratic_function`

**Purpose:** Draw a parabola given a quadratic equation

**LLM provides:** Equation string only  
**Frontend decides:** Color (blue for system), line width (2px), whether to show vertex/roots, all rendering logic

```json
{
  "type": "function",
  "function": {
    "name": "draw_quadratic_function",
    "description": "Draw a quadratic function (parabola) on the coordinate plane. The plane spans from -10 to +10 on both axes. Provide ONLY the equation in terms of x. Examples: 'x^2', '-2*x^2 + 3*x - 1', '0.5*x^2 - 4'. Do NOT specify colors, labels, or rendering options.",
    "parameters": {
      "type": "object",
      "properties": {
        "equation": {
          "type": "string",
          "description": "Quadratic equation in terms of x. Use standard math.js syntax with ^ for exponents. Examples: 'x^2', '-x^2 + 4', '0.5*x^2 - 3*x + 2'"
        }
      },
      "required": ["equation"]
    }
  }
}
```

**Example Tool Call:**
```json
{
  "name": "draw_quadratic_function",
  "arguments": {
    "equation": "x^2 - 4*x + 3"
  }
}
```

**Frontend Rendering Logic:**
```javascript
// Frontend constants
const SYSTEM_COLOR = '#2563eb'; // Blue
const SYSTEM_LINE_WIDTH = 2;

function renderQuadraticFunction(ctx, { equation }, bounds) {
  const expr = compile(equation);
  const step = (bounds.xMax - bounds.xMin) / (bounds.width * 2); // High resolution
  
  // Plot parabola with frontend-controlled styling
  ctx.strokeStyle = SYSTEM_COLOR;
  ctx.lineWidth = SYSTEM_LINE_WIDTH;
  ctx.beginPath();
  
  let started = false;
  for (let x = bounds.xMin; x <= bounds.xMax; x += step) {
    const y = expr.evaluate({ x });
    
    if (!isFinite(y) || y < bounds.yMin || y > bounds.yMax) {
      started = false;
      continue;
    }
    
    const [cx, cy] = worldToCanvas(x, y, bounds);
    
    if (!started) {
      ctx.moveTo(cx, cy);
      started = true;
    } else {
      ctx.lineTo(cx, cy);
    }
  }
  ctx.stroke();
}
```

---

### Tool 3: `draw_circle`

**Purpose:** Draw a circle with specified center and radius

**LLM provides:** Center coordinates (x, y) and radius  
**Frontend decides:** Color (blue for system), line width (2px), whether to fill, all rendering logic

```json
{
  "type": "function",
  "function": {
    "name": "draw_circle",
    "description": "Draw a circle on the coordinate plane. The plane spans from -10 to +10 on both axes. Provide center coordinates and radius ONLY. Do NOT specify colors, fill, labels, or rendering options.",
    "parameters": {
      "type": "object",
      "properties": {
        "centerX": {
          "type": "number",
          "description": "X-coordinate of circle center (between -10 and 10)"
        },
        "centerY": {
          "type": "number",
          "description": "Y-coordinate of circle center (between -10 and 10)"
        },
        "radius": {
          "type": "number",
          "description": "Radius of the circle in coordinate units"
        }
      },
      "required": ["centerX", "centerY", "radius"]
    }
  }
}
```

**Example Tool Call:**
```json
{
  "name": "draw_circle",
  "arguments": {
    "centerX": 2,
    "centerY": 3,
    "radius": 4
  }
}
```

**Frontend Rendering Logic:**
```javascript
// Frontend constants
const SYSTEM_COLOR = '#2563eb'; // Blue
const SYSTEM_LINE_WIDTH = 2;

function renderCircle(ctx, { centerX, centerY, radius }, bounds) {
  const [cx, cy] = worldToCanvas(centerX, centerY, bounds);
  
  // Convert radius from world coordinates to canvas pixels
  const radiusPixels = (radius / (bounds.xMax - bounds.xMin)) * bounds.width;
  
  // Draw circle with frontend-controlled styling
  ctx.strokeStyle = SYSTEM_COLOR;
  ctx.lineWidth = SYSTEM_LINE_WIDTH;
  ctx.beginPath();
  ctx.arc(cx, cy, radiusPixels, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Draw center point
  ctx.fillStyle = SYSTEM_COLOR;
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
  ctx.fill();
}
```

---

### Tool 4: `draw_square`

**Purpose:** Draw a square given four corner coordinates

**LLM provides:** Four corner coordinates (top-left, top-right, bottom-right, bottom-left)  
**Frontend decides:** Color (blue for system), line width (2px), whether to fill, all rendering logic

```json
{
  "type": "function",
  "function": {
    "name": "draw_square",
    "description": "Draw a square on the coordinate plane. The plane spans from -10 to +10 on both axes. Provide the four corner coordinates in order: top-left, top-right, bottom-right, bottom-left. Do NOT specify colors, fill, labels, or rendering options.",
    "parameters": {
      "type": "object",
      "properties": {
        "topLeftX": {
          "type": "number",
          "description": "X-coordinate of top-left corner (between -10 and 10)"
        },
        "topLeftY": {
          "type": "number",
          "description": "Y-coordinate of top-left corner (between -10 and 10)"
        },
        "topRightX": {
          "type": "number",
          "description": "X-coordinate of top-right corner (between -10 and 10)"
        },
        "topRightY": {
          "type": "number",
          "description": "Y-coordinate of top-right corner (between -10 and 10)"
        },
        "bottomRightX": {
          "type": "number",
          "description": "X-coordinate of bottom-right corner (between -10 and 10)"
        },
        "bottomRightY": {
          "type": "number",
          "description": "Y-coordinate of bottom-right corner (between -10 and 10)"
        },
        "bottomLeftX": {
          "type": "number",
          "description": "X-coordinate of bottom-left corner (between -10 and 10)"
        },
        "bottomLeftY": {
          "type": "number",
          "description": "Y-coordinate of bottom-left corner (between -10 and 10)"
        }
      },
      "required": ["topLeftX", "topLeftY", "topRightX", "topRightY", "bottomRightX", "bottomRightY", "bottomLeftX", "bottomLeftY"]
    }
  }
}
```

**Example Tool Call:**
```json
{
  "name": "draw_square",
  "arguments": {
    "topLeftX": -2,
    "topLeftY": 3,
    "topRightX": 2,
    "topRightY": 3,
    "bottomRightX": 2,
    "bottomRightY": -1,
    "bottomLeftX": -2,
    "bottomLeftY": -1
  }
}
```

**Frontend Rendering Logic:**
```javascript
// Frontend constants
const SYSTEM_COLOR = '#2563eb'; // Blue
const SYSTEM_LINE_WIDTH = 2;

function renderSquare(ctx, { topLeftX, topLeftY, topRightX, topRightY, bottomRightX, bottomRightY, bottomLeftX, bottomLeftY }, bounds) {
  const points = [
    worldToCanvas(topLeftX, topLeftY, bounds),
    worldToCanvas(topRightX, topRightY, bounds),
    worldToCanvas(bottomRightX, bottomRightY, bounds),
    worldToCanvas(bottomLeftX, bottomLeftY, bounds)
  ];
  
  // Draw square with frontend-controlled styling
  ctx.strokeStyle = SYSTEM_COLOR;
  ctx.lineWidth = SYSTEM_LINE_WIDTH;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  ctx.lineTo(points[1][0], points[1][1]);
  ctx.lineTo(points[2][0], points[2][1]);
  ctx.lineTo(points[3][0], points[3][1]);
  ctx.closePath();
  ctx.stroke();
  
  // Mark corner points
  ctx.fillStyle = SYSTEM_COLOR;
  points.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  });
}
```

---

### Tool 5: `draw_triangle`

**Purpose:** Draw a triangle given three vertex coordinates

**LLM provides:** Three vertex coordinates (vertex1, vertex2, vertex3)  
**Frontend decides:** Color (blue for system), line width (2px), whether to fill, all rendering logic

```json
{
  "type": "function",
  "function": {
    "name": "draw_triangle",
    "description": "Draw a triangle on the coordinate plane. The plane spans from -10 to +10 on both axes. Provide the three vertex coordinates. Do NOT specify colors, fill, labels, or rendering options.",
    "parameters": {
      "type": "object",
      "properties": {
        "vertex1X": {
          "type": "number",
          "description": "X-coordinate of first vertex (between -10 and 10)"
        },
        "vertex1Y": {
          "type": "number",
          "description": "Y-coordinate of first vertex (between -10 and 10)"
        },
        "vertex2X": {
          "type": "number",
          "description": "X-coordinate of second vertex (between -10 and 10)"
        },
        "vertex2Y": {
          "type": "number",
          "description": "Y-coordinate of second vertex (between -10 and 10)"
        },
        "vertex3X": {
          "type": "number",
          "description": "X-coordinate of third vertex (between -10 and 10)"
        },
        "vertex3Y": {
          "type": "number",
          "description": "Y-coordinate of third vertex (between -10 and 10)"
        }
      },
      "required": ["vertex1X", "vertex1Y", "vertex2X", "vertex2Y", "vertex3X", "vertex3Y"]
    }
  }
}
```

**Example Tool Call:**
```json
{
  "name": "draw_triangle",
  "arguments": {
    "vertex1X": 0,
    "vertex1Y": 4,
    "vertex2X": -3,
    "vertex2Y": -2,
    "vertex3X": 3,
    "vertex3Y": -2
  }
}
```

**Frontend Rendering Logic:**
```javascript
// Frontend constants
const SYSTEM_COLOR = '#2563eb'; // Blue
const SYSTEM_LINE_WIDTH = 2;

function renderTriangle(ctx, { vertex1X, vertex1Y, vertex2X, vertex2Y, vertex3X, vertex3Y }, bounds) {
  const points = [
    worldToCanvas(vertex1X, vertex1Y, bounds),
    worldToCanvas(vertex2X, vertex2Y, bounds),
    worldToCanvas(vertex3X, vertex3Y, bounds)
  ];
  
  // Draw triangle with frontend-controlled styling
  ctx.strokeStyle = SYSTEM_COLOR;
  ctx.lineWidth = SYSTEM_LINE_WIDTH;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  ctx.lineTo(points[1][0], points[1][1]);
  ctx.lineTo(points[2][0], points[2][1]);
  ctx.closePath();
  ctx.stroke();
  
  // Mark vertex points
  ctx.fillStyle = SYSTEM_COLOR;
  points.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  });
}
```

---

## State Management (Zustand)

### Canvas Store: `canvasStore.js`

All canvas state centralized in a Zustand store for predictable state updates and easy debugging.

```javascript
import { create } from 'zustand';

export const useCanvasStore = create((set, get) => ({
  // Fixed coordinate bounds for MVP
  bounds: {
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
    width: 800,  // Canvas pixel dimensions (can be updated)
    height: 600
  },
  
  // System renders (from LLM tool calls)
  systemRenders: [],
  
  // User drawing strokes (future feature)
  userStrokes: [],
  
  // Actions
  addSystemRender: (render) => set((state) => ({
    systemRenders: [...state.systemRenders, {
      id: crypto.randomUUID(),
      ...render,
      timestamp: Date.now()
    }]
  })),
  
  clearSystemRenders: () => set({ systemRenders: [] }),
  
  clearAllCanvas: () => set({
    systemRenders: [],
    userStrokes: []
  }),
  
  updateCanvasSize: (width, height) => set((state) => ({
    bounds: {
      ...state.bounds,
      width,
      height
    }
  })),
  
  addUserStroke: (stroke) => set((state) => ({
    userStrokes: [...state.userStrokes, stroke]
  })),
  
  clearUserStrokes: () => set({ userStrokes: [] })
}));
```

### Usage in Components

```javascript
// In a component
import { useCanvasStore } from './stores/canvasStore';

function CanvasController() {
  const { systemRenders, addSystemRender, clearAllCanvas } = useCanvasStore();
  
  // When LLM sends tool call
  const handleToolCall = (toolCall) => {
    addSystemRender({
      type: toolCall.name,
      params: JSON.parse(toolCall.arguments)
    });
  };
  
  return (
    <div>
      <button onClick={clearAllCanvas}>Clear Canvas</button>
      <GraphCanvas />
    </div>
  );
}
```

### Store Structure

```typescript
interface CanvasStore {
  bounds: {
    xMin: number;      // -10 (fixed for MVP)
    xMax: number;      // +10 (fixed for MVP)
    yMin: number;      // -10 (fixed for MVP)
    yMax: number;      // +10 (fixed for MVP)
    width: number;     // Canvas pixel width (responsive)
    height: number;    // Canvas pixel height (responsive)
  };
  
  systemRenders: SystemRender[];
  userStrokes: UserStroke[];
  
  addSystemRender: (render: Partial<SystemRender>) => void;
  clearSystemRenders: () => void;
  clearAllCanvas: () => void;
  updateCanvasSize: (width: number, height: number) => void;
  addUserStroke: (stroke: UserStroke) => void;
  clearUserStrokes: () => void;
}

interface SystemRender {
  id: string;
  type: 'draw_linear_function' | 'draw_quadratic_function' | 'draw_circle' | 'draw_square' | 'draw_triangle';
  params: Record<string, any>;
  timestamp: number;
}

interface UserStroke {
  id: string;
  points: { x: number; y: number; timestamp: number }[];
  color: string;
  lineWidth: number;
}
```

---

## Frontend Components

### Component Hierarchy

```
<MathTutorApp>
  ├── <ChatPanel>
  │   ├── <MessageList>
  │   │   └── <Message> (with LaTeX rendering via KaTeX)
  │   └── <MessageInput>
  │
  └── <CanvasPanel>
      ├── <CanvasController> (logic component)
      │   ├── bounds state
      │   ├── rendering queue
      │   └── tool call parser
      │
      └── <GraphCanvas> (visual component)
          ├── Grid Layer (drawn once)
          ├── System Layer (AI renders)
          └── User Layer (free drawing)
```

---

### Component 1: `GraphCanvas.jsx`

**Purpose:** Core canvas component with three-layer architecture using Zustand

```jsx
import React, { useRef, useEffect } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { drawGrid } from '../utils/gridRenderer';
import { renderSystemShape } from '../utils/shapeRenderer';

export function GraphCanvas({ width = 800, height = 600 }) {
  const canvasRef = useRef(null);
  const { bounds, systemRenders, userStrokes, updateCanvasSize } = useCanvasStore();
  
  // Update canvas size in store when dimensions change
  useEffect(() => {
    updateCanvasSize(width, height);
  }, [width, height, updateCanvasSize]);
  
  // Draw all layers whenever dependencies change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Layer 1: Grid (static background with fixed -10 to +10 bounds)
    drawGrid(ctx, bounds);
    
    // Layer 2: System renders (AI-generated shapes)
    systemRenders.forEach(render => {
      renderSystemShape(ctx, render, bounds);
    });
    
    // Layer 3: User strokes (future feature)
    userStrokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });
    
  }, [systemRenders, userStrokes, bounds, width, height]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ border: '1px solid #ccc' }}
    />
  );
}
```

---

### Component 2: Integrating with Chat (Tool Call Handler)

**Purpose:** Parse LLM tool calls and add to Zustand store

```jsx
import { useEffect } from 'react';
import { useCanvasStore } from '../stores/canvasStore';

export function useChatToolCalls(messages) {
  const { addSystemRender } = useCanvasStore();
  
  useEffect(() => {
    // Extract tool calls from latest message
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage?.toolCalls) return;
    
    latestMessage.toolCalls.forEach(toolCall => {
      // Only process drawing tool calls
      if (toolCall.name.startsWith('draw_')) {
        try {
          const params = typeof toolCall.arguments === 'string' 
            ? JSON.parse(toolCall.arguments) 
            : toolCall.arguments;
          
          addSystemRender({
            type: toolCall.name,
            params
          });
        } catch (error) {
          console.error('Failed to parse tool call:', error);
        }
      }
    });
  }, [messages, addSystemRender]);
}

// Usage in Chat component
function Chat() {
  const { messages } = useChat({ api: '/api/chat' });
  
  // Automatically process tool calls
  useChatToolCalls(messages);
  
  return (
    <div>
      <MessageList messages={messages} />
      <GraphCanvas />
    </div>
  );
}
```

---

## Math Rendering Engine

### Core Utilities: `mathUtils.js`

```javascript
import { compile, parse } from 'mathjs';

/**
 * Safely evaluate a mathematical expression
 */
export function evaluateExpression(equation, x) {
  try {
    const expr = compile(equation);
    const result = expr.evaluate({ x });
    return isFinite(result) ? result : null;
  } catch (error) {
    console.error('Math evaluation error:', error);
    return null;
  }
}

/**
 * Generate points for a function over a range
 */
export function generateFunctionPoints(equation, xMin, xMax, numPoints = 200) {
  const points = [];
  const step = (xMax - xMin) / numPoints;
  
  for (let x = xMin; x <= xMax; x += step) {
    const y = evaluateExpression(equation, x);
    if (y !== null) {
      points.push({ x, y });
    }
  }
  
  return points;
}

/**
 * Find approximate roots of an equation (zero crossings)
 */
export function findRoots(equation, xMin = -10, xMax = 10, tolerance = 0.01) {
  const roots = [];
  const step = 0.1;
  
  let prevY = evaluateExpression(equation, xMin);
  
  for (let x = xMin + step; x <= xMax; x += step) {
    const y = evaluateExpression(equation, x);
    
    if (prevY !== null && y !== null) {
      // Sign change indicates root
      if ((prevY < 0 && y > 0) || (prevY > 0 && y < 0)) {
        // Refine using bisection
        const root = bisectionMethod(equation, x - step, x, tolerance);
        if (root !== null) {
          roots.push(root);
        }
      }
    }
    
    prevY = y;
  }
  
  return roots;
}

function bisectionMethod(equation, a, b, tolerance) {
  let iterations = 0;
  const maxIterations = 50;
  
  while (iterations < maxIterations) {
    const mid = (a + b) / 2;
    const fMid = evaluateExpression(equation, mid);
    
    if (Math.abs(fMid) < tolerance || (b - a) / 2 < tolerance) {
      return mid;
    }
    
    const fA = evaluateExpression(equation, a);
    
    if (Math.sign(fMid) === Math.sign(fA)) {
      a = mid;
    } else {
      b = mid;
    }
    
    iterations++;
  }
  
  return null;
}

/**
 * Find vertex of a quadratic function
 */
export function findVertex(equation) {
  // Numerical approach: find local extremum
  const step = 0.01;
  let minY = Infinity;
  let vertexX = 0;
  
  for (let x = -10; x <= 10; x += step) {
    const y = evaluateExpression(equation, x);
    if (y !== null && Math.abs(y) < Math.abs(minY)) {
      minY = y;
      vertexX = x;
    }
  }
  
  return { x: vertexX, y: minY };
}
```

---

## Coordinate System & Transformations

### Core Functions: `coordinateTransform.js`

```javascript
/**
 * Convert world coordinates to canvas pixel coordinates
 * 
 * World coordinates: Mathematical coordinate system (e.g., -10 to 10)
 * Canvas coordinates: Pixel positions (0,0 is top-left)
 */
export function worldToCanvas(x, y, bounds) {
  const { xMin, xMax, yMin, yMax, width, height } = bounds;
  
  // Map x from [xMin, xMax] to [0, width]
  const canvasX = ((x - xMin) / (xMax - xMin)) * width;
  
  // Map y from [yMin, yMax] to [height, 0] (flip Y axis)
  const canvasY = height - ((y - yMin) / (yMax - yMin)) * height;
  
  return [canvasX, canvasY];
}

/**
 * Convert canvas pixel coordinates to world coordinates
 */
export function canvasToWorld(canvasX, canvasY, bounds) {
  const { xMin, xMax, yMin, yMax, width, height } = bounds;
  
  const x = xMin + (canvasX / width) * (xMax - xMin);
  const y = yMax - (canvasY / height) * (yMax - yMin);
  
  return [x, y];
}

/**
 * Convert world distance to canvas pixels
 * Useful for circles, sizes, etc.
 */
export function worldDistanceToCanvas(worldDist, bounds) {
  return (worldDist / (bounds.xMax - bounds.xMin)) * bounds.width;
}

/**
 * Zoom bounds by a factor
 */
export function zoomBounds(bounds, factor, centerX = 0, centerY = 0) {
  const xRange = (bounds.xMax - bounds.xMin) / factor;
  const yRange = (bounds.yMax - bounds.yMin) / factor;
  
  return {
    ...bounds,
    xMin: centerX - xRange / 2,
    xMax: centerX + xRange / 2,
    yMin: centerY - yRange / 2,
    yMax: centerY + yRange / 2
  };
}

/**
 * Pan bounds by a delta
 */
export function panBounds(bounds, deltaX, deltaY) {
  return {
    ...bounds,
    xMin: bounds.xMin + deltaX,
    xMax: bounds.xMax + deltaX,
    yMin: bounds.yMin + deltaY,
    yMax: bounds.yMax + deltaY
  };
}
```

---

### Grid Drawing: `gridRenderer.js`

```javascript
import { worldToCanvas } from './coordinateTransform';

/**
 * Draw the coordinate grid (axes, tick marks, labels)
 */
export function drawGrid(ctx, bounds) {
  const { xMin, xMax, yMin, yMax, width, height } = bounds;
  
  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Grid lines
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  
  // Vertical grid lines
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    const [cx] = worldToCanvas(x, 0, bounds);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();
  }
  
  // Horizontal grid lines
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    const [, cy] = worldToCanvas(0, y, bounds);
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.stroke();
  }
  
  // Axes
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  
  // X-axis (y = 0)
  if (yMin <= 0 && yMax >= 0) {
    const [, cy] = worldToCanvas(0, 0, bounds);
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.stroke();
    
    // X-axis arrow
    ctx.beginPath();
    ctx.moveTo(width - 10, cy - 5);
    ctx.lineTo(width, cy);
    ctx.lineTo(width - 10, cy + 5);
    ctx.stroke();
  }
  
  // Y-axis (x = 0)
  if (xMin <= 0 && xMax >= 0) {
    const [cx] = worldToCanvas(0, 0, bounds);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();
    
    // Y-axis arrow
    ctx.beginPath();
    ctx.moveTo(cx - 5, 10);
    ctx.lineTo(cx, 0);
    ctx.lineTo(cx + 5, 10);
    ctx.stroke();
  }
  
  // Tick marks and labels
  ctx.fillStyle = '#000000';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // X-axis tick marks
  const [, zeroY] = worldToCanvas(0, 0, bounds);
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    if (x === 0) continue; // Skip origin
    
    const [cx] = worldToCanvas(x, 0, bounds);
    
    // Tick mark
    ctx.beginPath();
    ctx.moveTo(cx, zeroY - 5);
    ctx.lineTo(cx, zeroY + 5);
    ctx.stroke();
    
    // Label
    ctx.fillText(x.toString(), cx, zeroY + 8);
  }
  
  // Y-axis tick marks
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const [zeroX] = worldToCanvas(0, 0, bounds);
  
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    if (y === 0) continue; // Skip origin
    
    const [, cy] = worldToCanvas(0, y, bounds);
    
    // Tick mark
    ctx.beginPath();
    ctx.moveTo(zeroX - 5, cy);
    ctx.lineTo(zeroX + 5, cy);
    ctx.stroke();
    
    // Label
    ctx.fillText(y.toString(), zeroX - 8, cy);
  }
  
  // Origin label
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText('0', zeroX - 8, zeroY + 8);
}
```

---

## Implementation Guide

### Phase 1: Core Infrastructure (Days 1-2)

**Goal:** Get grid + single shape rendering working

#### Tasks:
1. ✅ Install dependencies
   ```bash
   npm install mathjs
   ```

2. ✅ Create coordinate transform utilities
   - `coordinateTransform.js` with `worldToCanvas`, `canvasToWorld`
   - Unit tests for coordinate mapping

3. ✅ Create grid renderer
   - `gridRenderer.js` with `drawGrid` function
   - Static grid visible on canvas

4. ✅ Create `GraphCanvas` component
   - Canvas element with proper sizing
   - Grid renders on mount
   - Responsive to window resize

5. ✅ Test with hardcoded linear function
   - Manually call `renderLinearFunction` with test equation
   - Verify line appears correctly on grid

**Success Criteria:**
- Grid visible with proper axis labels
- Can manually render a line equation
- Coordinate mapping works correctly

---

### Phase 2: Tool Call Integration (Days 3-4)

**Goal:** LLM tool calls → Canvas renders

#### Tasks:
1. ✅ Update OpenAI prompt with tool definitions
   - Add all 6 tool definitions to system prompt
   - Test tool calling with simple prompts

2. ✅ Create tool call parser
   - `parseToolCall` function in `CanvasController`
   - Handle JSON parsing errors gracefully

3. ✅ Implement render dispatcher
   - Map tool names to render functions
   - Queue system for multiple renders

4. ✅ Create all render functions
   - `renderLinearFunction`
   - `renderQuadraticFunction`
   - `renderCircle`
   - `renderRectangle`
   - `renderPolygon`
   - `renderPoint`

5. ✅ Integrate with chat streaming
   - Parse tool calls from streaming response
   - Update canvas in real-time as tools arrive

**Success Criteria:**
- Can ask "Draw y = 2x + 3" and see line appear
- Can ask "Draw a circle at (2, 3) with radius 4" and see circle
- Multiple shapes can coexist on canvas

---

### Phase 3: Math Utilities (Day 5)

**Goal:** Advanced features (vertex, roots, etc.)

#### Tasks:
1. ✅ Implement `mathUtils.js`
   - `evaluateExpression`
   - `generateFunctionPoints`
   - `findRoots`
   - `findVertex`

2. ✅ Add vertex marking for parabolas
   - Modify `renderQuadraticFunction` to show vertex

3. ✅ Add root marking for parabolas
   - Implement `showRoots` parameter

4. ✅ Test with complex equations
   - Piecewise functions
   - Trigonometric functions
   - Edge cases (vertical asymptotes, etc.)

**Success Criteria:**
- Parabola shows labeled vertex
- Roots are correctly marked
- No crashes on invalid equations

---

### Phase 4: User Drawing Layer (Day 6)

**Goal:** Students can draw on top of system renders

#### Tasks:
1. ✅ Implement pointer event handlers
   - `onPointerDown`, `onPointerMove`, `onPointerUp`
   - Track drawing state

2. ✅ Create stroke data structure
   ```javascript
   {
     id: uuid(),
     points: [{x, y, timestamp}, ...],
     color: 'black',
     lineWidth: 2
   }
   ```

3. ✅ Render user strokes on top of system layer
   - Smooth line rendering
   - Support for different colors/widths

4. ✅ Add drawing tools UI
   - Pen, eraser, colors
   - Clear canvas button

**Success Criteria:**
- Can draw freehand on canvas
- Drawings persist alongside system renders
- No interference between layers

---

### Phase 5: Polish & Optimization (Day 7)

**Goal:** Production-ready

#### Tasks:
1. ✅ Zoom/pan controls
   - Mouse wheel zoom
   - Click-drag pan
   - Reset button

2. ✅ Performance optimization
   - Debounce canvas redraws
   - Use `requestAnimationFrame` for animations
   - Memoize expensive calculations

3. ✅ Error handling
   - Graceful degradation for invalid equations
   - User-friendly error messages
   - Fallback for unsupported browsers

4. ✅ Accessibility
   - Keyboard shortcuts
   - ARIA labels
   - High contrast mode

5. ✅ Documentation
   - Inline code comments
   - README with examples
   - Tool usage guide for LLM prompting

**Success Criteria:**
- Smooth 60fps performance
- Works in all major browsers
- Clear error messages
- Full documentation

---

## Task Breakdown (MVP)

### Epic 1: State Management Setup
- [ ] Task 1.1: Install dependencies (`zustand`, `mathjs`)
- [ ] Task 1.2: Create Zustand canvas store (`canvasStore.js`)
- [ ] Task 1.3: Define fixed bounds (-10 to +10) in store
- [ ] Task 1.4: Add actions for system renders (add, clear)
- [ ] Task 1.5: Test store with simple state updates

### Epic 2: Coordinate System & Grid
- [ ] Task 2.1: Implement `worldToCanvas` transformation
- [ ] Task 2.2: Implement `canvasToWorld` transformation  
- [ ] Task 2.3: Write unit tests for coordinate transforms
- [ ] Task 2.4: Create grid rendering function with fixed bounds
- [ ] Task 2.5: Add axis labels and tick marks

### Epic 3: Core Canvas Component
- [ ] Task 3.1: Create `GraphCanvas` component using Zustand
- [ ] Task 3.2: Connect to canvas store for bounds and renders
- [ ] Task 3.3: Implement canvas ref and context setup
- [ ] Task 3.4: Add effect to redraw on state changes
- [ ] Task 3.5: Test canvas renders grid correctly

### Epic 4: Shape Renderers
- [ ] Task 4.1: Implement `renderLinearFunction` (equation only)
- [ ] Task 4.2: Implement `renderQuadraticFunction` (equation only)
- [ ] Task 4.3: Implement `renderCircle` (center + radius)
- [ ] Task 4.4: Implement `renderSquare` (4 corners)
- [ ] Task 4.5: Implement `renderTriangle` (3 vertices)
- [ ] Task 4.6: Create unified `renderSystemShape` dispatcher
- [ ] Task 4.7: Test each renderer with hardcoded data

### Epic 5: Tool Call Integration
- [ ] Task 5.1: Define 5 tool schemas (simplified, no styling params)
- [ ] Task 5.2: Add tools to OpenAI system prompt
- [ ] Task 5.3: Include coordinate bounds info in prompt
- [ ] Task 5.4: Create `useChatToolCalls` hook
- [ ] Task 5.5: Parse tool calls and add to Zustand store
- [ ] Task 5.6: Test with mock tool call data

### Epic 6: Chat Integration
- [ ] Task 6.1: Integrate GraphCanvas into Chat component
- [ ] Task 6.2: Connect tool calls from chat messages to canvas
- [ ] Task 6.3: Add clear canvas button
- [ ] Task 6.4: Test end-to-end with real LLM responses
- [ ] Task 6.5: Handle edge cases (invalid equations, out of bounds)

### Epic 7: Polish & Testing
- [ ] Task 7.1: Add error handling for math.js evaluation
- [ ] Task 7.2: Test all 5 tool types end-to-end
- [ ] Task 7.3: Verify consistent blue styling
- [ ] Task 7.4: Cross-browser testing
- [ ] Task 7.5: Write inline documentation

**Post-MVP Features (Future):**
- User drawing layer
- Zoom/pan controls
- Additional shapes (polygons, ellipses)
- Color customization
- Vertex/root highlighting
- Animation support

---

## Code Examples

### Example 1: Complete Working Prototype

**File: `GraphCanvas.jsx`**

```jsx
import React, { useRef, useEffect, useState } from 'react';
import { compile } from 'mathjs';

// Coordinate transformation utilities
const worldToCanvas = (x, y, bounds) => {
  const canvasX = ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * bounds.width;
  const canvasY = bounds.height - ((y - bounds.yMin) / (bounds.yMax - bounds.yMin)) * bounds.height;
  return [canvasX, canvasY];
};

// Grid drawing function
const drawGrid = (ctx, bounds) => {
  const { xMin, xMax, yMin, yMax, width, height } = bounds;
  
  // Clear background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Grid lines
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    const [cx] = worldToCanvas(x, 0, bounds);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();
  }
  
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    const [, cy] = worldToCanvas(0, y, bounds);
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.stroke();
  }
  
  // Axes
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  
  // X-axis
  if (yMin <= 0 && yMax >= 0) {
    const [, cy] = worldToCanvas(0, 0, bounds);
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.stroke();
  }
  
  // Y-axis
  if (xMin <= 0 && xMax >= 0) {
    const [cx] = worldToCanvas(0, 0, bounds);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();
  }
  
  // Tick marks and labels
  ctx.fillStyle = '#000000';
  ctx.font = '12px Arial';
  const [zeroX, zeroY] = worldToCanvas(0, 0, bounds);
  
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    if (x === 0) continue;
    const [cx] = worldToCanvas(x, 0, bounds);
    ctx.textAlign = 'center';
    ctx.fillText(x.toString(), cx, zeroY + 15);
  }
  
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    if (y === 0) continue;
    const [, cy] = worldToCanvas(0, y, bounds);
    ctx.textAlign = 'right';
    ctx.fillText(y.toString(), zeroX - 10, cy + 4);
  }
};

// Render a linear function
const renderLinearFunction = (ctx, { equation, color = 'blue' }, bounds) => {
  try {
    const expr = compile(equation);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const x1 = bounds.xMin;
    const y1 = expr.evaluate({ x: x1 });
    const x2 = bounds.xMax;
    const y2 = expr.evaluate({ x: x2 });
    
    const [cx1, cy1] = worldToCanvas(x1, y1, bounds);
    const [cx2, cy2] = worldToCanvas(x2, y2, bounds);
    
    ctx.moveTo(cx1, cy1);
    ctx.lineTo(cx2, cy2);
    ctx.stroke();
  } catch (error) {
    console.error('Error rendering linear function:', error);
  }
};

// Render a quadratic function
const renderQuadraticFunction = (ctx, { equation, color = 'red', showVertex = true }, bounds) => {
  try {
    const expr = compile(equation);
    const step = (bounds.xMax - bounds.xMin) / (bounds.width * 2);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    let started = false;
    for (let x = bounds.xMin; x <= bounds.xMax; x += step) {
      const y = expr.evaluate({ x });
      
      if (!isFinite(y) || y < bounds.yMin || y > bounds.yMax) {
        started = false;
        continue;
      }
      
      const [cx, cy] = worldToCanvas(x, y, bounds);
      
      if (!started) {
        ctx.moveTo(cx, cy);
        started = true;
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();
    
    // Mark vertex
    if (showVertex) {
      let minY = Infinity;
      let vertexX = 0;
      
      for (let x = bounds.xMin; x <= bounds.xMax; x += 0.1) {
        const y = expr.evaluate({ x });
        if (isFinite(y) && Math.abs(y) < Math.abs(minY)) {
          minY = y;
          vertexX = x;
        }
      }
      
      const [vx, vy] = worldToCanvas(vertexX, minY, bounds);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(vx, vy, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillText(`V(${vertexX.toFixed(1)}, ${minY.toFixed(1)})`, vx + 10, vy - 10);
    }
  } catch (error) {
    console.error('Error rendering quadratic function:', error);
  }
};

// Render a circle
const renderCircle = (ctx, { centerX, centerY, radius, color = 'green', fill = false }, bounds) => {
  const [cx, cy] = worldToCanvas(centerX, centerY, bounds);
  const radiusPixels = (radius / (bounds.xMax - bounds.xMin)) * bounds.width;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radiusPixels, 0, 2 * Math.PI);
  
  if (fill) {
    ctx.fillStyle = color + '33';
    ctx.fill();
  }
  
  ctx.stroke();
  
  // Center point
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
  ctx.fill();
};

// Main dispatcher
const renderSystemShape = (ctx, render, bounds) => {
  switch (render.type) {
    case 'draw_linear_function':
      renderLinearFunction(ctx, render.params, bounds);
      break;
    case 'draw_quadratic_function':
      renderQuadraticFunction(ctx, render.params, bounds);
      break;
    case 'draw_circle':
      renderCircle(ctx, render.params, bounds);
      break;
    // Add other cases...
    default:
      console.warn('Unknown render type:', render.type);
  }
};

// Main component
export function GraphCanvas({ systemRenders = [], width = 800, height = 600 }) {
  const canvasRef = useRef(null);
  const [bounds] = useState({
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
    width,
    height
  });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Layer 1: Grid
    drawGrid(ctx, bounds);
    
    // Layer 2: System renders
    systemRenders.forEach(render => {
      renderSystemShape(ctx, render, bounds);
    });
  }, [systemRenders, bounds]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ border: '1px solid #ccc' }}
    />
  );
}
```

---

### Example 2: Usage with Tool Calls

```jsx
import { GraphCanvas } from './GraphCanvas';

function MathTutorApp() {
  const [systemRenders, setSystemRenders] = useState([]);
  
  // Simulate receiving tool calls from OpenAI
  const handleToolCall = (toolCall) => {
    const newRender = {
      type: toolCall.name,
      params: JSON.parse(toolCall.arguments)
    };
    
    setSystemRenders(prev => [...prev, newRender]);
  };
  
  // Example: Manually trigger renders for testing
  const testLinear = () => {
    handleToolCall({
      name: 'draw_linear_function',
      arguments: JSON.stringify({ equation: '2*x + 3', color: 'blue' })
    });
  };
  
  const testParabola = () => {
    handleToolCall({
      name: 'draw_quadratic_function',
      arguments: JSON.stringify({ 
        equation: 'x^2 - 4*x + 3', 
        color: 'red',
        showVertex: true 
      })
    });
  };
  
  const testCircle = () => {
    handleToolCall({
      name: 'draw_circle',
      arguments: JSON.stringify({ 
        centerX: 0, 
        centerY: 0, 
        radius: 5, 
        color: 'green' 
      })
    });
  };
  
  return (
    <div>
      <div>
        <button onClick={testLinear}>Test Linear</button>
        <button onClick={testParabola}>Test Parabola</button>
        <button onClick={testCircle}>Test Circle</button>
        <button onClick={() => setSystemRenders([])}>Clear</button>
      </div>
      
      <GraphCanvas systemRenders={systemRenders} />
    </div>
  );
}
```

---

### Example 3: Integration with Vercel AI SDK

```jsx
import { useChat } from 'ai/react';
import { GraphCanvas } from './GraphCanvas';

function ChatWithCanvas() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName.startsWith('draw_')) {
        handleCanvasToolCall(toolCall);
      }
    }
  });
  
  const [systemRenders, setSystemRenders] = useState([]);
  
  const handleCanvasToolCall = (toolCall) => {
    const newRender = {
      type: toolCall.toolName,
      params: toolCall.args
    };
    
    setSystemRenders(prev => [...prev, newRender]);
  };
  
  return (
    <div className="app-layout">
      <div className="chat-panel">
        {messages.map(m => (
          <div key={m.id}>
            <strong>{m.role}:</strong> {m.content}
          </div>
        ))}
        
        <form onSubmit={handleSubmit}>
          <input value={input} onChange={handleInputChange} />
          <button type="submit">Send</button>
        </form>
      </div>
      
      <div className="canvas-panel">
        <GraphCanvas systemRenders={systemRenders} />
      </div>
    </div>
  );
}
```

---

## System Prompt Example

```
You are a patient, encouraging math tutor using the Socratic method.

COORDINATE PLANE DETAILS:
- The coordinate plane is FIXED at -10 to +10 on both X and Y axes
- This is a standard 4-quadrant Cartesian plane
- All coordinates you provide MUST be within these bounds (-10 ≤ x ≤ 10, -10 ≤ y ≤ 10)

AVAILABLE TOOLS FOR VISUALIZATION:
You have access to the following drawing tools to visualize mathematical concepts:

1. draw_linear_function - For straight lines (provide equation ONLY, e.g., "2*x + 3")
2. draw_quadratic_function - For parabolas (provide equation ONLY, e.g., "x^2 - 4*x + 3")
3. draw_circle - For circles (provide center coordinates and radius)
4. draw_square - For squares (provide four corner coordinates)
5. draw_triangle - For triangles (provide three vertex coordinates)

CRITICAL TOOL GUIDELINES:
- Provide ONLY the minimal required data (equations or coordinates)
- DO NOT specify colors, labels, fills, or any styling - the system handles this
- Keep equations in math.js syntax: use * for multiplication, ^ for exponents
- For shapes, provide coordinate points within the -10 to +10 bounds
- The system will automatically render everything with consistent blue styling

WHEN TO USE TOOLS:
- When a student asks to visualize a function: "Can you graph y = 2x + 3?"
- When explaining concepts visually: "Let's see what this parabola looks like"
- When showing geometric shapes: "Here's a right triangle"

EXAMPLE INTERACTIONS:

Student: "Can you graph y = x² - 4?"
You: "Absolutely! Let's visualize this parabola. [call draw_quadratic_function with equation='x^2 - 4']. Notice how it opens upward and crosses the x-axis at two points. Where do you think the vertex is located?"

Student: "Draw a circle with center (2, 3) and radius 4"
You: "Sure! [call draw_circle with centerX=2, centerY=3, radius=4]. There's your circle. What can you tell me about the relationship between the center and any point on the circle?"

Student: "Show me a right triangle"
You: "Great! Let's draw a right triangle. [call draw_triangle with vertex1X=0, vertex1Y=0, vertex2X=3, vertex2Y=0, vertex3X=0, vertex3Y=4]. This is a 3-4-5 right triangle. Can you identify which angle is the right angle?"
```

---

## Appendix: Performance Optimization

### Optimization Checklist

1. **Memoization**
   ```jsx
   const memoizedRenders = useMemo(() => {
     return systemRenders.map(render => ({
       ...render,
       points: generateFunctionPoints(render.params.equation, bounds)
     }));
   }, [systemRenders, bounds]);
   ```

2. **Debouncing Canvas Redraws**
   ```jsx
   const debouncedRender = useMemo(
     () => debounce(() => renderCanvas(), 16), // 60fps
     [renderCanvas]
   );
   ```

3. **Offscreen Canvas for Grid**
   ```jsx
   const gridCanvas = useRef(null);
   
   useEffect(() => {
     // Draw grid once to offscreen canvas
     const offscreen = document.createElement('canvas');
     const ctx = offscreen.getContext('2d');
     drawGrid(ctx, bounds);
     gridCanvas.current = offscreen;
   }, [bounds]);
   
   // Blit grid from offscreen canvas
   ctx.drawImage(gridCanvas.current, 0, 0);
   ```

4. **RequestAnimationFrame for Smooth Drawing**
   ```jsx
   const animateDrawing = useCallback(() => {
     const frameId = requestAnimationFrame(() => {
       renderCanvas();
       animateDrawing();
     });
     
     return () => cancelAnimationFrame(frameId);
   }, [renderCanvas]);
   ```

---

## Appendix: Testing Strategy

### Unit Tests

```javascript
// coordinateTransform.test.js
import { worldToCanvas, canvasToWorld } from './coordinateTransform';

describe('Coordinate Transformations', () => {
  const bounds = {
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
    width: 800,
    height: 600
  };
  
  test('worldToCanvas converts origin correctly', () => {
    const [cx, cy] = worldToCanvas(0, 0, bounds);
    expect(cx).toBe(400); // Center of 800px width
    expect(cy).toBe(300); // Center of 600px height
  });
  
  test('canvasToWorld is inverse of worldToCanvas', () => {
    const [x, y] = [3, -2];
    const [cx, cy] = worldToCanvas(x, y, bounds);
    const [x2, y2] = canvasToWorld(cx, cy, bounds);
    expect(x2).toBeCloseTo(x, 5);
    expect(y2).toBeCloseTo(y, 5);
  });
});
```

### Integration Tests

```javascript
// GraphCanvas.test.jsx
import { render, screen } from '@testing-library/react';
import { GraphCanvas } from './GraphCanvas';

test('renders canvas element', () => {
  render(<GraphCanvas />);
  const canvas = screen.getByRole('img'); // Canvas has implicit img role
  expect(canvas).toBeInTheDocument();
});

test('renders linear function correctly', () => {
  const renders = [{
    type: 'draw_linear_function',
    params: { equation: '2*x + 3', color: 'blue' }
  }];
  
  const { container } = render(<GraphCanvas systemRenders={renders} />);
  const canvas = container.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  
  // Verify line was drawn (check canvas pixel data)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const hasBluePixels = Array.from(imageData.data).some((val, i) => 
    i % 4 === 2 && val > 200 // Blue channel
  );
  
  expect(hasBluePixels).toBe(true);
});
```

---

## Summary

This TDD provides:
- ✅ **5 minimal, deterministic tool definitions** (linear, quadratic, circle, square, triangle)
- ✅ **LLM-simplified tool calls** (equations/coordinates only, no styling decisions)
- ✅ **Frontend-controlled rendering** (all colors, line widths, styling determined by frontend)
- ✅ **Fixed coordinate bounds** (-10 to +10, no zoom/pan for MVP)
- ✅ **Zustand state management** (centralized canvas state)
- ✅ **Complete rendering engine with math.js**
- ✅ **Three-layer canvas architecture**
- ✅ **Coordinate transformation system**
- ✅ **Static grid with proper axis labels**
- ✅ **Working code examples**
- ✅ **Detailed implementation tasks**

**Key Simplifications for MVP:**
- Fixed -10 to +10 coordinate plane (no zoom/pan complexity)
- LLM only provides equations or coordinate points
- All styling (colors, line widths) hardcoded on frontend
- Reduced shape set: circle, square, triangle only
- Zustand for state management (easier to track changes)

**Next Steps:**
1. Install dependencies: `npm install zustand mathjs`
2. Create Zustand canvas store
3. Implement coordinate transformation utilities
4. Create rendering functions for each tool type
5. Integrate with existing chat UI
6. Add system prompt with coordinate bounds info
7. Test and iterate

**Estimated Timeline:** 3-5 days for MVP implementation

**Questions or Need Clarification?** This document should serve as your complete implementation roadmap. Refer back to specific sections as you build each component.
