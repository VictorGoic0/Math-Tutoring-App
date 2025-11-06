import { latexToCanvas, drawLatexToCanvas } from './latexToCanvas';

/**
 * Canvas Renderer Utility
 * 
 * Handles rendering different types of content on the canvas:
 * - Equations (LaTeX)
 * - Labels (text annotations)
 * - Diagrams (geometric shapes)
 */

// Auto-positioning state
let lastRenderY = 50; // Start 50px from top
const VERTICAL_SPACING = 20;
const HORIZONTAL_MARGIN = 50;

/**
 * Reset auto-positioning tracker
 * Called when canvas is cleared
 */
export function resetAutoPosition() {
  lastRenderY = 50;
}

/**
 * Get next auto-position Y coordinate
 * 
 * @param {number} renderHeight - Height of the render to position
 * @returns {number} Y coordinate
 */
function getNextAutoPositionY(renderHeight) {
  const y = lastRenderY;
  lastRenderY += renderHeight + VERTICAL_SPACING;
  return y;
}

/**
 * Main render function
 * Delegates to specific render functions based on type
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} renderData - Render data from canvasStore
 * @param {number} canvasWidth - Canvas width for auto-positioning
 * @param {number} canvasHeight - Canvas height for bounds checking
 * @returns {Promise<Object>} Render bounds: { x, y, width, height }
 */
export async function renderToCanvas(ctx, renderData, canvasWidth, canvasHeight) {
  const { type } = renderData;

  switch (type) {
    case 'equation':
      return await renderEquation(ctx, renderData, canvasWidth);
    
    case 'label':
      return renderLabel(ctx, renderData, canvasWidth);
    
    case 'diagram':
      return renderDiagram(ctx, renderData);
    
    default:
      console.warn('Unknown render type:', type);
      return { x: 0, y: 0, width: 0, height: 0 };
  }
}

/**
 * Render LaTeX equation
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} renderData - { latex, x?, y? }
 * @param {number} canvasWidth - Canvas width
 * @returns {Promise<Object>} Render bounds
 */
async function renderEquation(ctx, renderData, canvasWidth) {
  const { latex, x, y } = renderData;

  try {
    // Render LaTeX to element
    const latexRender = await latexToCanvas(latex, {
      color: '#2563EB', // Blue for equations (distinct from user strokes)
      fontSize: 24,
    });

    // Determine position (manual or auto)
    const posX = x !== undefined ? x : HORIZONTAL_MARGIN;
    const posY = y !== undefined ? y : getNextAutoPositionY(latexRender.height);

    // Draw subtle background with light blue tint for visibility
    ctx.save();
    ctx.fillStyle = 'rgba(219, 234, 254, 0.3)'; // Very light blue background
    ctx.fillRect(
      posX - 8,
      posY - 6,
      latexRender.width + 16,
      latexRender.height + 12
    );
    ctx.restore();

    // Draw to canvas
    await drawLatexToCanvas(
      ctx,
      latexRender.element,
      posX,
      posY,
      latexRender.width,
      latexRender.height
    );

    return {
      x: posX,
      y: posY,
      width: latexRender.width,
      height: latexRender.height,
    };
  } catch (error) {
    console.error('Failed to render equation:', latex, error);
    // Return empty bounds on error
    return { x: 0, y: 0, width: 0, height: 0 };
  }
}

/**
 * Render text label
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} renderData - { text, x?, y?, fontSize? }
 * @param {number} canvasWidth - Canvas width
 * @returns {Object} Render bounds
 */
function renderLabel(ctx, renderData, canvasWidth) {
  const { text, x, y, fontSize = 14 } = renderData;

  // Set text styling
  ctx.save();
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = '#64748B'; // Gray for labels (distinct from user strokes)
  ctx.textBaseline = 'top';

  // Measure text
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize * 1.2; // Approximate height

  // Determine position (manual or auto)
  const posX = x !== undefined ? x : HORIZONTAL_MARGIN;
  const posY = y !== undefined ? y : getNextAutoPositionY(textHeight);

  // Draw subtle background with border for clear distinction
  ctx.fillStyle = 'rgba(248, 250, 252, 0.9)'; // Very light gray/white
  ctx.fillRect(posX - 6, posY - 3, textWidth + 12, textHeight + 6);
  
  // Draw subtle border
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)'; // Light gray border
  ctx.lineWidth = 1;
  ctx.strokeRect(posX - 6, posY - 3, textWidth + 12, textHeight + 6);

  // Draw text
  ctx.fillStyle = '#64748B';
  ctx.fillText(text, posX, posY);

  ctx.restore();

  return {
    x: posX,
    y: posY,
    width: textWidth,
    height: textHeight,
  };
}

/**
 * Render diagram (geometric shape)
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} renderData - { diagramType, points, strokeColor?, fillColor?, strokeWidth? }
 * @returns {Object} Render bounds
 */
function renderDiagram(ctx, renderData) {
  const {
    diagramType,
    points,
    strokeColor = '#1E40AF', // Default to dark blue for system diagrams (distinct from black user strokes)
    fillColor,
    strokeWidth = 2.5, // Slightly thicker for visibility
  } = renderData;

  if (!points || points.length === 0) {
    console.warn('Diagram has no points:', renderData);
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.9; // Slight transparency for visual distinction

  if (fillColor) {
    ctx.fillStyle = fillColor;
  }

  let bounds = { x: 0, y: 0, width: 0, height: 0 };

  switch (diagramType) {
    case 'line':
      bounds = drawLine(ctx, points);
      break;
    
    case 'circle':
      bounds = drawCircle(ctx, points, fillColor);
      break;
    
    case 'rectangle':
      bounds = drawRectangle(ctx, points, fillColor);
      break;
    
    case 'polygon':
      bounds = drawPolygon(ctx, points, fillColor);
      break;
    
    case 'arrow':
      bounds = drawArrow(ctx, points);
      break;
    
    case 'parabola':
      // Render parabola as a smooth curve through points
      bounds = drawParabola(ctx, points, fillColor);
      break;
    
    default:
      console.warn('Unknown diagram type:', diagramType);
  }

  ctx.restore();

  return bounds;
}

/**
 * Draw line
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} points - [start, end]
 * @returns {Object} Bounds
 */
function drawLine(ctx, points) {
  if (points.length < 2) return { x: 0, y: 0, width: 0, height: 0 };

  const [start, end] = points;
  
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

/**
 * Draw circle
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} points - [center, pointOnCircumference]
 * @param {string|null} fillColor - Fill color
 * @returns {Object} Bounds
 */
function drawCircle(ctx, points, fillColor) {
  if (points.length < 2) return { x: 0, y: 0, width: 0, height: 0 };

  const [center, circumferencePoint] = points;
  
  // Calculate radius
  const radius = Math.sqrt(
    Math.pow(circumferencePoint.x - center.x, 2) +
    Math.pow(circumferencePoint.y - center.y, 2)
  );

  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  
  if (fillColor) {
    ctx.fill();
  }
  ctx.stroke();

  return {
    x: center.x - radius,
    y: center.y - radius,
    width: radius * 2,
    height: radius * 2,
  };
}

/**
 * Draw rectangle
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} points - [topLeft, bottomRight]
 * @param {string|null} fillColor - Fill color
 * @returns {Object} Bounds
 */
function drawRectangle(ctx, points, fillColor) {
  if (points.length < 2) return { x: 0, y: 0, width: 0, height: 0 };

  const [topLeft, bottomRight] = points;
  const width = bottomRight.x - topLeft.x;
  const height = bottomRight.y - topLeft.y;

  if (fillColor) {
    ctx.fillRect(topLeft.x, topLeft.y, width, height);
  }
  ctx.strokeRect(topLeft.x, topLeft.y, width, height);

  return {
    x: topLeft.x,
    y: topLeft.y,
    width: Math.abs(width),
    height: Math.abs(height),
  };
}

/**
 * Draw polygon
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} points - Array of vertices
 * @param {string|null} fillColor - Fill color
 * @returns {Object} Bounds
 */
function drawPolygon(ctx, points, fillColor) {
  if (points.length < 3) return { x: 0, y: 0, width: 0, height: 0 };

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.closePath();

  if (fillColor) {
    ctx.fill();
  }
  ctx.stroke();

  // Calculate bounds
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Draw arrow
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} points - [start, end]
 * @returns {Object} Bounds
 */
function drawArrow(ctx, points) {
  if (points.length < 2) return { x: 0, y: 0, width: 0, height: 0 };

  const [start, end] = points;
  
  // Draw line
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  // Draw arrowhead
  const headLength = 15;
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(
    end.x - headLength * Math.cos(angle - Math.PI / 6),
    end.y - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(
    end.x - headLength * Math.cos(angle + Math.PI / 6),
    end.y - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();

  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

/**
 * Draw parabola (smooth curve)
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} points - Array of points along the curve
 * @param {string|null} fillColor - Fill color
 * @returns {Object} Bounds
 */
function drawParabola(ctx, points, fillColor) {
  if (points.length < 3) return { x: 0, y: 0, width: 0, height: 0 };

  // Draw smooth curve through points using quadratic curves
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  // Use quadratic curves for smoother parabola
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }

  // Draw to last point
  const lastPoint = points[points.length - 1];
  ctx.lineTo(lastPoint.x, lastPoint.y);

  if (fillColor) {
    ctx.fill();
  }
  ctx.stroke();

  // Calculate bounds
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

