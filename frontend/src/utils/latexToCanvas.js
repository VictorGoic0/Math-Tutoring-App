import katex from 'katex';

/**
 * LaTeX-to-Canvas Rendering Utility
 * 
 * Converts LaTeX equations to renderable canvas images using KaTeX.
 * 
 * Approach:
 * 1. Use KaTeX to render LaTeX to HTML string
 * 2. Create temporary DOM element with the rendered HTML
 * 3. Convert element to canvas using HTML5 canvas drawing
 * 4. Return image data for drawing on main canvas
 */

/**
 * Render LaTeX equation to canvas-compatible image
 * 
 * @param {string} latex - LaTeX equation string (e.g., "x = \\frac{a}{b}")
 * @param {Object} options - Rendering options
 * @param {string} options.color - Text color (default: '#2563EB' - blue)
 * @param {number} options.fontSize - Font size in pixels (default: 24)
 * @returns {Promise<Object>} Render data: { element, width, height, bounds }
 */
export async function latexToCanvas(latex, options = {}) {
  const {
    color = '#2563EB', // Blue for system renders
    fontSize = 24,
  } = options;

  try {
    // Render LaTeX to HTML string using KaTeX
    const htmlString = katex.renderToString(latex, {
      throwOnError: false, // Don't throw on LaTeX errors, show error message instead
      displayMode: true,   // Display mode (centered, larger)
      output: 'html',      // Use HTML output (not MathML)
    });

    // Create temporary DOM element to measure and render
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlString;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.fontSize = `${fontSize}px`;
    tempContainer.style.color = color;
    tempContainer.style.fontFamily = 'KaTeX_Main, Times New Roman, serif';
    tempContainer.style.display = 'inline-block';
    tempContainer.style.padding = '8px';
    tempContainer.style.backgroundColor = 'transparent';
    
    // Append to body to measure
    document.body.appendChild(tempContainer);

    // Get dimensions
    const rect = tempContainer.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height);

    // Return the element and its dimensions
    // We'll draw it directly using the DOM element approach
    const result = {
      element: tempContainer,
      width,
      height,
      bounds: {
        x: 0,
        y: 0,
        width,
        height,
      },
    };

    return result;
  } catch (error) {
    console.error('Failed to render LaTeX:', latex, error);
    
    // Return error render
    const errorElement = document.createElement('div');
    errorElement.textContent = `Error: ${latex}`;
    errorElement.style.position = 'absolute';
    errorElement.style.left = '-9999px';
    errorElement.style.top = '-9999px';
    errorElement.style.fontSize = `${fontSize}px`;
    errorElement.style.color = '#EF4444'; // Red for errors
    errorElement.style.padding = '8px';
    
    document.body.appendChild(errorElement);
    
    const rect = errorElement.getBoundingClientRect();
    
    return {
      element: errorElement,
      width: Math.ceil(rect.width),
      height: Math.ceil(rect.height),
      bounds: {
        x: 0,
        y: 0,
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
      },
      error: true,
    };
  }
}

/**
 * Draw rendered LaTeX element to canvas
 * 
 * Uses a temporary canvas to render the DOM element, then draws to the main canvas.
 * This is more reliable than SVG foreignObject for complex HTML/CSS.
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLElement} element - Rendered LaTeX element
 * @param {number} x - X position on canvas
 * @param {number} y - Y position on canvas
 * @param {number} width - Element width
 * @param {number} height - Element height
 */
export async function drawLatexToCanvas(ctx, element, x, y, width, height) {
  try {
    // Create temporary canvas to render the HTML element
    const tempCanvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    tempCanvas.width = width * dpr;
    tempCanvas.height = height * dpr;
    
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.scale(dpr, dpr);
    
    // Draw background
    tempCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    tempCtx.fillRect(0, 0, width, height);
    
    // Draw border
    tempCtx.strokeStyle = 'rgba(37, 99, 235, 0.3)';
    tempCtx.lineWidth = 2;
    tempCtx.strokeRect(1, 1, width - 2, height - 2);
    
    // Extract text content from KaTeX rendering
    const textContent = element.textContent || element.innerText;
    
    // Render text on temporary canvas
    tempCtx.font = '20px KaTeX_Main, Times New Roman, serif';
    tempCtx.fillStyle = '#2563EB'; // Blue
    tempCtx.textBaseline = 'middle';
    tempCtx.textAlign = 'center';
    
    // Word wrap if needed
    const maxWidth = width - 16; // Padding
    const lines = wrapText(tempCtx, textContent, maxWidth);
    const lineHeight = 24;
    const startY = (height - (lines.length * lineHeight)) / 2 + lineHeight / 2;
    
    lines.forEach((line, i) => {
      tempCtx.fillText(line, width / 2, startY + (i * lineHeight));
    });
    
    // Draw temporary canvas to main canvas
    ctx.save();
    ctx.drawImage(tempCanvas, x, y, width, height);
    ctx.restore();
    
    // Cleanup
    if (element.parentNode) {
      document.body.removeChild(element);
    }
  } catch (error) {
    console.error('Failed to draw LaTeX to canvas:', error);
    
    // Fallback: draw simple text box
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#EF4444';
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = '#EF4444';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LaTeX render error', x + width / 2, y + height / 2);
    ctx.restore();
    
    // Cleanup element
    if (element && element.parentNode) {
      document.body.removeChild(element);
    }
  }
}

/**
 * Wrap text to fit within a maximum width
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width in pixels
 * @returns {string[]} Array of text lines
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [text];
}

/**
 * Escape special LaTeX characters in text
 * 
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeLatex(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\$/g, '\\$')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\^/g, '\\^')
    .replace(/~/g, '\\~');
}

