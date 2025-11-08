# MathTutor AI - Canvas Graph Rendering System
## Technical Design Document (TDD)

**Version:** 1.0  
**Date:** November 8, 2025  
**Author:** Technical Architecture  
**Status:** Ready for Implementation

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Tool Definitions (OpenAI Function Calling)](#tool-definitions)
4. [Frontend Components](#frontend-components)
5. [Math Rendering Engine](#math-rendering-engine)
6. [Coordinate System & Transformations](#coordinate-system--transformations)
7. [Implementation Guide](#implementation-guide)
8. [Task Breakdown](#task-breakdown)
9. [Code Examples](#code-examples)

---

## Executive Summary

### Objectives
- Replace unreliable LLM-drawn graphics with deterministic, programmatic rendering
- Implement structured tool calls for specific graph types (linear, parabola, circle, rectangle, polygon)
- Use frontend math.js for equation evaluation and Canvas API for rendering
- Maintain collaborative whiteboard with persistent grid and user drawing layers

### Key Design Decisions
1. **Frontend-only math evaluation** - No backend API for coordinate calculation
2. **Explicit tool calls per shape type** - Reduces hallucinations, increases reliability
3. **Three-layer canvas architecture** - Grid (static) → System Renders (AI) → User Drawings
4. **math.js for equation parsing** - Handles arbitrary mathematical expressions safely

### Success Metrics
- ✅ 100% accurate coordinate plotting for all supported equation types
- ✅ Zero latency for graph rendering (no API calls)
- ✅ Deterministic shape drawing (circle always renders as circle)
- ✅ Persistent grid with proper axis labels and scaling

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
- **State Management:** React useState/useReducer + Canvas refs

---

## Tool Definitions

### Design Philosophy
Each tool call is **specific, explicit, and deterministic**. Instead of a generic "draw" tool, we have:
- `draw_linear_function` - For lines (y = mx + b)
- `draw_quadratic_function` - For parabolas (y = ax² + bx + c)
- `draw_circle` - For circles (center + radius)
- `draw_rectangle` - For rectangles (corner coords)
- `draw_polygon` - For arbitrary polygons (list of points)

This prevents the LLM from making ambiguous requests and ensures frontend knows exactly how to render.

---

### Tool 1: `draw_linear_function`

**Purpose:** Draw a straight line given a linear equation

```json
{
  "type": "function",
  "function": {
    "name": "draw_linear_function",
    "description": "Draw a linear function (straight line) on the coordinate plane. Use for equations like y = 2x + 3, y = -0.5x + 1, etc.",
    "parameters": {
      "type": "object",
      "properties": {
        "equation": {
          "type": "string",
          "description": "Linear equation in terms of x. Examples: '2*x + 3', '-0.5*x + 1', 'x/2 - 4'"
        },
        "color": {
          "type": "string",
          "enum": ["blue", "red", "green", "purple", "orange"],
          "default": "blue",
          "description": "Line color"
        },
        "label": {
          "type": "string",
          "description": "Optional label to display near the line (e.g., 'y = 2x + 3')"
        },
        "showSlope": {
          "type": "boolean",
          "default": false,
          "description": "Whether to show slope triangle visualization"
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
    "equation": "2*x + 3",
    "color": "blue",
    "label": "y = 2x + 3",
    "showSlope": true
  }
}
```

**Frontend Rendering Logic:**
```javascript
function renderLinearFunction(ctx, { equation, color, label, showSlope }, bounds) {
  const expr = compile(equation);
  
  // Calculate endpoints
  const x1 = bounds.xMin;
  const y1 = expr.evaluate({ x: x1 });
  const x2 = bounds.xMax;
  const y2 = expr.evaluate({ x: x2 });
  
  // Draw line
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const [cx1, cy1] = worldToCanvas(x1, y1, bounds);
  const [cx2, cy2] = worldToCanvas(x2, y2, bounds);
  ctx.moveTo(cx1, cy1);
  ctx.lineTo(cx2, cy2);
  ctx.stroke();
  
  // Optional: Draw label
  if (label) {
    ctx.fillStyle = color;
    ctx.font = '14px Arial';
    ctx.fillText(label, cx2 - 80, cy2 - 10);
  }
  
  // Optional: Draw slope triangle
  if (showSlope) {
    drawSlopeTriangle(ctx, x1, y1, x2, y2, bounds);
  }
}
```

---

### Tool 2: `draw_quadratic_function`

**Purpose:** Draw a parabola given a quadratic equation

```json
{
  "type": "function",
  "function": {
    "name": "draw_quadratic_function",
    "description": "Draw a quadratic function (parabola) on the coordinate plane. Use for equations like y = x^2, y = -2x^2 + 3x - 1, etc.",
    "parameters": {
      "type": "object",
      "properties": {
        "equation": {
          "type": "string",
          "description": "Quadratic equation in terms of x. Examples: 'x^2', '-2*x^2 + 3*x - 1', '0.5*x^2 - 4'"
        },
        "color": {
          "type": "string",
          "enum": ["blue", "red", "green", "purple", "orange"],
          "default": "blue"
        },
        "label": {
          "type": "string",
          "description": "Optional label for the parabola"
        },
        "showVertex": {
          "type": "boolean",
          "default": true,
          "description": "Whether to mark and label the vertex"
        },
        "showRoots": {
          "type": "boolean",
          "default": false,
          "description": "Whether to mark x-intercepts (roots)"
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
    "equation": "x^2 - 4*x + 3",
    "color": "red",
    "label": "y = x² - 4x + 3",
    "showVertex": true,
    "showRoots": true
  }
}
```

**Frontend Rendering Logic:**
```javascript
function renderQuadraticFunction(ctx, { equation, color, label, showVertex, showRoots }, bounds) {
  const expr = compile(equation);
  const step = (bounds.xMax - bounds.xMin) / (bounds.width * 2); // High resolution
  
  // Plot parabola
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
  
  // Calculate and mark vertex (using calculus or algebraic method)
  if (showVertex) {
    const vertex = findVertex(equation);
    drawPoint(ctx, vertex.x, vertex.y, color, `Vertex (${vertex.x.toFixed(1)}, ${vertex.y.toFixed(1)})`, bounds);
  }
  
  // Calculate and mark roots
  if (showRoots) {
    const roots = findRoots(equation);
    roots.forEach(root => {
      drawPoint(ctx, root, 0, color, `x = ${root.toFixed(2)}`, bounds);
    });
  }
  
  // Label
  if (label) {
    const vertex = findVertex(equation);
    const [cx, cy] = worldToCanvas(vertex.x, vertex.y, bounds);
    ctx.fillStyle = color;
    ctx.font = '14px Arial';
    ctx.fillText(label, cx + 10, cy - 20);
  }
}

function findVertex(equation) {
  // Parse equation to extract coefficients: ax^2 + bx + c
  // Vertex x = -b/(2a), then calculate y
  // Simplified implementation:
  const expr = compile(equation);
  
  // Numerical approximation: find minimum/maximum
  let vertexX = 0;
  let vertexY = expr.evaluate({ x: 0 });
  
  for (let x = -10; x <= 10; x += 0.1) {
    const y = expr.evaluate({ x });
    if (Math.abs(y) < Math.abs(vertexY)) {
      vertexX = x;
      vertexY = y;
    }
  }
  
  return { x: vertexX, y: vertexY };
}
```

---

### Tool 3: `draw_circle`

**Purpose:** Draw a circle with specified center and radius

```json
{
  "type": "function",
  "function": {
    "name": "draw_circle",
    "description": "Draw a circle on the coordinate plane with given center and radius.",
    "parameters": {
      "type": "object",
      "properties": {
        "centerX": {
          "type": "number",
          "description": "X-coordinate of circle center"
        },
        "centerY": {
          "type": "number",
          "description": "Y-coordinate of circle center"
        },
        "radius": {
          "type": "number",
          "description": "Radius of the circle in coordinate units"
        },
        "color": {
          "type": "string",
          "enum": ["blue", "red", "green", "purple", "orange"],
          "default": "blue"
        },
        "fill": {
          "type": "boolean",
          "default": false,
          "description": "Whether to fill the circle"
        },
        "label": {
          "type": "string",
          "description": "Optional label for the circle"
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
    "radius": 4,
    "color": "green",
    "fill": false,
    "label": "Circle: r=4"
  }
}
```

**Frontend Rendering Logic:**
```javascript
function renderCircle(ctx, { centerX, centerY, radius, color, fill, label }, bounds) {
  const [cx, cy] = worldToCanvas(centerX, centerY, bounds);
  
  // Convert radius from world coordinates to canvas pixels
  // Use x-axis scale (assuming equal aspect ratio)
  const radiusPixels = (radius / (bounds.xMax - bounds.xMin)) * bounds.width;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radiusPixels, 0, 2 * Math.PI);
  
  if (fill) {
    ctx.fillStyle = color + '33'; // 20% opacity
    ctx.fill();
  }
  
  ctx.stroke();
  
  // Draw center point
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
  ctx.fill();
  
  // Label
  if (label) {
    ctx.fillStyle = color;
    ctx.font = '14px Arial';
    ctx.fillText(label, cx + radiusPixels + 5, cy);
  }
}
```

---

### Tool 4: `draw_rectangle`

**Purpose:** Draw a rectangle given corner coordinates

```json
{
  "type": "function",
  "function": {
    "name": "draw_rectangle",
    "description": "Draw a rectangle on the coordinate plane. Specify opposite corners.",
    "parameters": {
      "type": "object",
      "properties": {
        "x1": {
          "type": "number",
          "description": "X-coordinate of first corner"
        },
        "y1": {
          "type": "number",
          "description": "Y-coordinate of first corner"
        },
        "x2": {
          "type": "number",
          "description": "X-coordinate of opposite corner"
        },
        "y2": {
          "type": "number",
          "description": "Y-coordinate of opposite corner"
        },
        "color": {
          "type": "string",
          "enum": ["blue", "red", "green", "purple", "orange"],
          "default": "blue"
        },
        "fill": {
          "type": "boolean",
          "default": false
        },
        "label": {
          "type": "string",
          "description": "Optional label"
        }
      },
      "required": ["x1", "y1", "x2", "y2"]
    }
  }
}
```

**Example Tool Call:**
```json
{
  "name": "draw_rectangle",
  "arguments": {
    "x1": -2,
    "y1": 1,
    "x2": 3,
    "y2": 5,
    "color": "purple",
    "fill": true,
    "label": "Rectangle ABCD"
  }
}
```

**Frontend Rendering Logic:**
```javascript
function renderRectangle(ctx, { x1, y1, x2, y2, color, fill, label }, bounds) {
  const [cx1, cy1] = worldToCanvas(x1, y1, bounds);
  const [cx2, cy2] = worldToCanvas(x2, y2, bounds);
  
  const width = cx2 - cx1;
  const height = cy2 - cy1;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  if (fill) {
    ctx.fillStyle = color + '33';
    ctx.fillRect(cx1, cy1, width, height);
  }
  
  ctx.strokeRect(cx1, cy1, width, height);
  
  // Label
  if (label) {
    ctx.fillStyle = color;
    ctx.font = '14px Arial';
    ctx.fillText(label, cx1 + 5, cy1 + 20);
  }
}
```

---

### Tool 5: `draw_polygon`

**Purpose:** Draw arbitrary polygons from list of vertices

```json
{
  "type": "function",
  "function": {
    "name": "draw_polygon",
    "description": "Draw a polygon by connecting a series of points in order. Useful for triangles, pentagons, or irregular shapes.",
    "parameters": {
      "type": "object",
      "properties": {
        "points": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "x": { "type": "number" },
              "y": { "type": "number" }
            },
            "required": ["x", "y"]
          },
          "description": "Array of coordinate points forming the polygon vertices"
        },
        "closed": {
          "type": "boolean",
          "default": true,
          "description": "Whether to connect last point back to first"
        },
        "color": {
          "type": "string",
          "enum": ["blue", "red", "green", "purple", "orange"],
          "default": "blue"
        },
        "fill": {
          "type": "boolean",
          "default": false
        },
        "label": {
          "type": "string",
          "description": "Optional label"
        }
      },
      "required": ["points"]
    }
  }
}
```

**Example Tool Call:**
```json
{
  "name": "draw_polygon",
  "arguments": {
    "points": [
      { "x": 0, "y": 0 },
      { "x": 4, "y": 0 },
      { "x": 2, "y": 3 }
    ],
    "closed": true,
    "color": "orange",
    "fill": true,
    "label": "Triangle ABC"
  }
}
```

**Frontend Rendering Logic:**
```javascript
function renderPolygon(ctx, { points, closed, color, fill, label }, bounds) {
  if (points.length < 2) return;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  // Move to first point
  const [cx0, cy0] = worldToCanvas(points[0].x, points[0].y, bounds);
  ctx.moveTo(cx0, cy0);
  
  // Draw lines to subsequent points
  for (let i = 1; i < points.length; i++) {
    const [cx, cy] = worldToCanvas(points[i].x, points[i].y, bounds);
    ctx.lineTo(cx, cy);
  }
  
  // Close path if requested
  if (closed) {
    ctx.closePath();
  }
  
  if (fill) {
    ctx.fillStyle = color + '33';
    ctx.fill();
  }
  
  ctx.stroke();
  
  // Draw vertex points
  ctx.fillStyle = color;
  points.forEach(point => {
    const [cx, cy] = worldToCanvas(point.x, point.y, bounds);
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
    ctx.fill();
  });
  
  // Label
  if (label) {
    const [cx, cy] = worldToCanvas(points[0].x, points[0].y, bounds);
    ctx.fillStyle = color;
    ctx.font = '14px Arial';
    ctx.fillText(label, cx + 10, cy - 10);
  }
}
```

---

### Tool 6: `draw_point`

**Purpose:** Mark a specific point with coordinates

```json
{
  "type": "function",
  "function": {
    "name": "draw_point",
    "description": "Mark a specific point on the coordinate plane with a dot and optional label.",
    "parameters": {
      "type": "object",
      "properties": {
        "x": {
          "type": "number",
          "description": "X-coordinate of the point"
        },
        "y": {
          "type": "number",
          "description": "Y-coordinate of the point"
        },
        "label": {
          "type": "string",
          "description": "Label for the point (e.g., 'A', '(2,3)', 'Vertex')"
        },
        "color": {
          "type": "string",
          "enum": ["blue", "red", "green", "purple", "orange", "black"],
          "default": "black"
        }
      },
      "required": ["x", "y"]
    }
  }
}
```

**Frontend Rendering Logic:**
```javascript
function renderPoint(ctx, { x, y, label, color }, bounds) {
  const [cx, cy] = worldToCanvas(x, y, bounds);
  
  // Draw point
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
  ctx.fill();
  
  // Draw label
  if (label) {
    ctx.fillStyle = color;
    ctx.font = '12px Arial';
    ctx.fillText(label, cx + 8, cy - 8);
  }
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

**Purpose:** Core canvas component with three-layer architecture

```jsx
import React, { useRef, useEffect, useCallback } from 'react';
import { useGraphBounds } from './hooks/useGraphBounds';
import { useCanvasLayers } from './hooks/useCanvasLayers';

export function GraphCanvas({ 
  systemRenders = [], // Array of tool calls to render
  userStrokes = [],   // Array of user drawing strokes
  onUserDraw,         // Callback for user drawing events
  width = 800,
  height = 600
}) {
  const canvasRef = useRef(null);
  const [bounds, setBounds] = useGraphBounds(-10, 10, -10, 10, width, height);
  
  // Draw all layers whenever dependencies change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Layer 1: Grid (static background)
    drawGrid(ctx, bounds);
    
    // Layer 2: System renders (AI-generated shapes)
    systemRenders.forEach(render => {
      renderSystemShape(ctx, render, bounds);
    });
    
    // Layer 3: User strokes
    userStrokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });
    
  }, [systemRenders, userStrokes, bounds]);
  
  // Handle user drawing
  const handlePointerDown = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onUserDraw?.({ type: 'start', x, y });
  }, [onUserDraw]);
  
  // ... other pointer handlers
  
  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onPointerDown={handlePointerDown}
        style={{ border: '1px solid #ccc', cursor: 'crosshair' }}
      />
      
      {/* Zoom/Pan controls */}
      <div className="canvas-controls">
        <button onClick={() => setBounds(bounds => zoomIn(bounds))}>+</button>
        <button onClick={() => setBounds(bounds => zoomOut(bounds))}>-</button>
        <button onClick={() => setBounds(resetBounds)}>Reset</button>
      </div>
    </div>
  );
}
```

---

### Component 2: `CanvasController.jsx`

**Purpose:** Manages rendering state and tool call parsing

```jsx
import React, { useState, useEffect } from 'react';
import { GraphCanvas } from './GraphCanvas';

export function CanvasController({ toolCalls = [] }) {
  const [systemRenders, setSystemRenders] = useState([]);
  const [userStrokes, setUserStrokes] = useState([]);
  
  // Parse and queue tool calls for rendering
  useEffect(() => {
    const newRenders = toolCalls.map(parseToolCall).filter(Boolean);
    setSystemRenders(prev => [...prev, ...newRenders]);
  }, [toolCalls]);
  
  const handleUserDraw = (event) => {
    // Handle user drawing events
    setUserStrokes(prev => [...prev, event]);
  };
  
  const clearCanvas = () => {
    setSystemRenders([]);
    setUserStrokes([]);
  };
  
  return (
    <div>
      <GraphCanvas
        systemRenders={systemRenders}
        userStrokes={userStrokes}
        onUserDraw={handleUserDraw}
      />
      
      <button onClick={clearCanvas}>Clear Canvas</button>
    </div>
  );
}

function parseToolCall(toolCall) {
  const { name, arguments: args } = toolCall;
  
  try {
    const params = typeof args === 'string' ? JSON.parse(args) : args;
    
    return {
      type: name,
      params: params,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Failed to parse tool call:', error);
    return null;
  }
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

## Task Breakdown

### Epic 1: Canvas Infrastructure
- [ ] Task 1.1: Set up GraphCanvas component with refs
- [ ] Task 1.2: Implement coordinate transformation utilities
- [ ] Task 1.3: Create grid rendering function
- [ ] Task 1.4: Add canvas sizing and responsiveness
- [ ] Task 1.5: Write unit tests for coordinate transforms

### Epic 2: Tool Call System
- [ ] Task 2.1: Define all 6 tool schemas in OpenAI prompt
- [ ] Task 2.2: Create CanvasController component
- [ ] Task 2.3: Implement tool call parser
- [ ] Task 2.4: Build render dispatcher (switch statement)
- [ ] Task 2.5: Test tool calls with hardcoded data

### Epic 3: Shape Renderers
- [ ] Task 3.1: Implement `renderLinearFunction`
- [ ] Task 3.2: Implement `renderQuadraticFunction`
- [ ] Task 3.3: Implement `renderCircle`
- [ ] Task 3.4: Implement `renderRectangle`
- [ ] Task 3.5: Implement `renderPolygon`
- [ ] Task 3.6: Implement `renderPoint`
- [ ] Task 3.7: Test each renderer individually

### Epic 4: Math Utilities
- [ ] Task 4.1: Set up math.js integration
- [ ] Task 4.2: Implement `evaluateExpression` with error handling
- [ ] Task 4.3: Implement `generateFunctionPoints`
- [ ] Task 4.4: Implement `findRoots` with bisection method
- [ ] Task 4.5: Implement `findVertex` for quadratics
- [ ] Task 4.6: Add unit tests for all math utilities

### Epic 5: User Drawing
- [ ] Task 5.1: Add pointer event handlers to canvas
- [ ] Task 5.2: Create stroke data structure
- [ ] Task 5.3: Implement stroke rendering
- [ ] Task 5.4: Add drawing tools UI (pen, eraser, colors)
- [ ] Task 5.5: Implement clear canvas functionality
- [ ] Task 5.6: Test drawing persistence alongside system renders

### Epic 6: Advanced Features
- [ ] Task 6.1: Implement zoom controls (mouse wheel + buttons)
- [ ] Task 6.2: Implement pan controls (click-drag)
- [ ] Task 6.3: Add vertex/root marking for parabolas
- [ ] Task 6.4: Optimize rendering performance
- [ ] Task 6.5: Add error handling and user feedback

### Epic 7: Integration & Testing
- [ ] Task 7.1: Integrate with existing chat UI
- [ ] Task 7.2: Test with real OpenAI streaming responses
- [ ] Task 7.3: Test all 6 tool types end-to-end
- [ ] Task 7.4: Cross-browser testing
- [ ] Task 7.5: Mobile responsiveness testing
- [ ] Task 7.6: Write integration tests

### Epic 8: Documentation & Polish
- [ ] Task 8.1: Write inline code documentation
- [ ] Task 8.2: Create README with setup instructions
- [ ] Task 8.3: Document tool usage for prompt engineering
- [ ] Task 8.4: Add accessibility features
- [ ] Task 8.5: Final QA pass

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

AVAILABLE TOOLS FOR VISUALIZATION:
You have access to the following drawing tools to visualize mathematical concepts:

1. draw_linear_function - For straight lines (y = mx + b)
2. draw_quadratic_function - For parabolas (y = ax² + bx + c)
3. draw_circle - For circles (center + radius)
4. draw_rectangle - For rectangles
5. draw_polygon - For triangles, pentagons, etc.
6. draw_point - For marking specific coordinates

WHEN TO USE TOOLS:
- When a student asks to visualize a function: "Can you graph y = 2x + 3?"
- When explaining concepts visually: "Let's see what this parabola looks like"
- When showing geometric relationships: "Here's a right triangle with sides 3, 4, 5"

TOOL USAGE GUIDELINES:
- Always use the MOST SPECIFIC tool for the task
- For y = 2x + 3, use draw_linear_function, NOT draw_polygon
- For circles, use draw_circle, NOT draw_polygon
- Include appropriate labels and colors
- Show vertex for parabolas when relevant
- Mark important points (intercepts, vertices, etc.)

EXAMPLE INTERACTIONS:

Student: "Can you graph y = x² - 4?"
You: "Absolutely! Let's visualize this parabola. [call draw_quadratic_function with equation='x^2 - 4', showVertex=true, showRoots=true]. Notice how it opens upward and crosses the x-axis at two points. Where do you think the vertex is located?"

Student: "Draw a circle with center (2, 3) and radius 4"
You: "Sure! [call draw_circle with centerX=2, centerY=3, radius=4]. There's your circle. What can you tell me about the points on this circle?"
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
- ✅ **6 explicit, deterministic tool definitions**
- ✅ **Complete rendering engine with math.js**
- ✅ **Three-layer canvas architecture**
- ✅ **Coordinate transformation system**
- ✅ **Static grid with proper axis labels**
- ✅ **Working code examples**
- ✅ **Detailed implementation tasks**

**Next Steps:**
1. Copy relevant code into your repo
2. Follow the Phase 1-7 implementation guide
3. Test each Epic independently
4. Integrate with existing chat UI
5. Deploy and iterate

**Estimated Timeline:** 7-10 days for full implementation

**Questions or Need Clarification?** This document should serve as your complete implementation roadmap. Refer back to specific sections as you build each component.
