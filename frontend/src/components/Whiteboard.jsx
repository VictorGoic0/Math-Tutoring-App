import { useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { colors, spacing, borderRadius, shadows } from '../styles/tokens';
import { renderToCanvas, resetAutoPosition } from '../utils/canvasRenderer';

/**
 * Whiteboard Component
 * 
 * Provides a canvas element for drawing and rendering mathematical content.
 * Integrates with Zustand store for state management.
 */
function Whiteboard() {
  const canvasRef = useRef(null);
  
  // Calculate initial dimensions based on viewport
  // Assumes canvas is 65% width and full height minus header (80px)
  const initialDimensions = {
    width: Math.floor(window.innerWidth * 0.65),
    height: Math.floor(window.innerHeight - 80)
  };
  
  const [dimensions, setDimensions] = useState(initialDimensions);
  const [isRendering, setIsRendering] = useState(false);
  
  // Use explicit selectors to ensure reactivity
  // Using systemRenders.length as a dependency to force re-render when array changes
  const systemRenders = useCanvasStore(state => state.systemRenders);
  const systemRendersLength = useCanvasStore(state => state.systemRenders.length);
  const strokes = useCanvasStore(state => state.strokes);
  const isLocked = useCanvasStore(state => state.isLocked);
  const steps = useCanvasStore(state => state.steps);
  const currentStepIndex = useCanvasStore(state => state.currentStepIndex);
  const goToNextStep = useCanvasStore(state => state.goToNextStep);
  const goToPreviousStep = useCanvasStore(state => state.goToPreviousStep);

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
        
        console.log('📐 Canvas dimensions from getBoundingClientRect:', { width, height });
        
        // Don't update if width is 0 (container not visible yet) - keep initial dimensions
        if (width === 0 || height === 0) {
          console.log('⚠️ Container has 0 dimensions, keeping initial dimensions');
          return;
        }
        
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

  // Global keyboard listeners for arrow keys
  useEffect(() => {
    // console.log('⌨️ Setting up arrow key listeners. Steps available:', steps.length);
    
    const handleKeyDown = (e) => {
      // console.log('⌨️ Key pressed:', e.key, 'Steps:', steps.length, 'Current index:', currentStepIndex);
      // Only handle arrow keys if we have steps to navigate
      if (steps.length === 0) {
        console.log('⌨️ No steps available, ignoring arrow key');
        return;
      }
      
      // Only handle if not typing in an input/textarea
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        console.log('⌨️ Typing in input field, ignoring arrow key');
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        console.log('⬅️ Left arrow pressed, going to previous step');
        goToPreviousStep();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        console.log('➡️ Right arrow pressed, going to next step');
        goToNextStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    console.log('⌨️ Arrow key listeners attached');
    
    return () => {
      console.log('⌨️ Removing arrow key listeners');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [steps.length, currentStepIndex, goToNextStep, goToPreviousStep]);

  // Redraw canvas when state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    console.log(dimensions, "<--- dimensions in redraw");
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) {
      console.log('⏸️ Canvas not ready for rendering:', { canvas: !!canvas, dimensions, initialDimensions });
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent concurrent renders - if already rendering, skip this update
    // The effect will run again when isRendering becomes false
    if (isRendering) {
      console.log('⏸️ Already rendering, skipping...');
      return;
    }

    console.log('🎨 Redrawing canvas with', systemRenders.length, 'system renders');

    async function redrawCanvas() {
      setIsRendering(true);

      try {
        // Clear canvas
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        // Reset auto-positioning for new render cycle
        resetAutoPosition();

        // Draw system renders first (background layer)
        for (const render of systemRenders) {
          try {
            await renderToCanvas(ctx, render, dimensions.width, dimensions.height);
          } catch (error) {
            console.error('Failed to render system content:', render, error);
          }
        }

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
      } finally {
        setIsRendering(false);
      }
    }

    redrawCanvas();
  }, [strokes, systemRenders, systemRendersLength, dimensions.width, dimensions.height, isRendering]);

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

  // Navigation button styles
  const navButtonStyles = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: colors.background.paper,
    border: `1px solid ${colors.divider}`,
    borderRadius: borderRadius.base,
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: shadows.md,
    zIndex: 10,
    transition: 'all 0.2s ease',
    fontSize: '20px',
    color: colors.text.primary,
  };

  const navButtonHoverStyles = {
    backgroundColor: colors.action.hover,
    boxShadow: shadows.lg,
  };

  const navButtonDisabledStyles = {
    opacity: 0.4,
    cursor: 'not-allowed',
  };

  const canGoPrevious = currentStepIndex > 0;
  const canGoNext = currentStepIndex < steps.length - 1;

  // Log button visibility for debugging
  useEffect(() => {
    console.log('🔘 Button visibility check:', { 
      stepsLength: steps.length, 
      willShow: steps.length > 1, 
      currentStepIndex,
      canGoPrevious,
      canGoNext
    });
  }, [steps.length, currentStepIndex, canGoPrevious, canGoNext]);

  const handlePrevious = () => {
    if (canGoPrevious) {
      goToPreviousStep();
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      goToNextStep();
    }
  };

  return (
    <div style={containerStyles}>
      <canvas
        ref={canvasRef}
        style={canvasStyles}
      />
      
      {/* Navigation buttons - only show if we have multiple steps */}
      {steps.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            style={{
              ...navButtonStyles,
              left: spacing[4],
              ...(!canGoPrevious ? navButtonDisabledStyles : {}),
            }}
            onMouseEnter={(e) => {
              if (canGoPrevious) {
                Object.assign(e.target.style, navButtonHoverStyles);
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = navButtonStyles.backgroundColor;
              e.target.style.boxShadow = navButtonStyles.boxShadow;
            }}
            aria-label="Previous step"
          >
            ←
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            style={{
              ...navButtonStyles,
              right: spacing[4],
              ...(!canGoNext ? navButtonDisabledStyles : {}),
            }}
            onMouseEnter={(e) => {
              if (canGoNext) {
                Object.assign(e.target.style, navButtonHoverStyles);
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = navButtonStyles.backgroundColor;
              e.target.style.boxShadow = navButtonStyles.boxShadow;
            }}
            aria-label="Next step"
          >
            →
          </button>
        </>
      )}
    </div>
  );
}

export default Whiteboard;

