import { useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { colors } from '../styles/tokens';

/**
 * Whiteboard Component
 * 
 * Provides a canvas element for drawing and rendering mathematical content.
 * Integrates with Zustand store for state management.
 */
function Whiteboard() {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const {
    strokes,
    systemRenders,
    isLocked,
  } = useCanvasStore();

  // Initialize canvas and handle resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateDimensions = () => {
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        setDimensions({ width, height });
        
        const dpr = window.devicePixelRatio || 1;
        
        // Set canvas size (internal resolution)
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        // Set display size (CSS pixels)
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        // Scale context for high DPI displays
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
      }
    };

    // Initial setup
    updateDimensions();

    // Handle window resize
    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Redraw canvas when state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw system renders first (background layer)
    systemRenders.forEach((render) => {
      // TODO: Implement system render drawing in PR #2
      // For now, this is a placeholder
    });

    // Draw user strokes on top
    strokes.forEach((stroke) => {
      if (stroke.points && stroke.points.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = stroke.color || '#000000';
        ctx.lineWidth = stroke.width || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const points = stroke.points;
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.stroke();
      }
    });
  }, [strokes, systemRenders, dimensions]);

  const containerStyles = {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral.lightBase, // Slightly darker than chat background for visual distinction
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  const canvasStyles = {
    width: '100%',
    height: '100%',
    display: 'block',
    cursor: isLocked ? 'not-allowed' : 'crosshair',
    touchAction: isLocked ? 'none' : 'auto',
  };

  return (
    <div style={containerStyles}>
      <canvas
        ref={canvasRef}
        style={canvasStyles}
      />
    </div>
  );
}

export default Whiteboard;

