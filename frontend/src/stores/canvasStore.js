import { create } from 'zustand';

/**
 * Canvas Store
 * 
 * Manages the state of the whiteboard canvas including:
 * - User-drawn strokes
 * - System-rendered content (equations, diagrams, labels)
 * - Current drawing tool
 * - Color selection
 * - Lock state (prevents drawing when locked)
 * - Step tracking (for navigation and persistence)
 */
export const useCanvasStore = create((set, get) => ({
  // User-drawn strokes
  strokes: [],
  
  // System-rendered content (equations, diagrams, annotations)
  systemRenders: [],
  
  // Step tracking for navigation
  steps: [],
  currentStepIndex: -1, // -1 means no steps yet
  
  // Current drawing tool ('pen' | 'eraser')
  currentTool: 'pen',
  
  // Current drawing color
  color: '#000000',
  
  // Whether drawing is locked (prevents user input)
  isLocked: true,
  
  // Whether canvas should be visible (triggers UI to show canvas)
  shouldShowCanvas: false,
  
  // Actions
  addStroke: (stroke) => set((state) => ({
    strokes: [...state.strokes, stroke]
  })),
  
  clearStrokes: () => set({ strokes: [] }),
  
  removeStroke: (strokeId) => set((state) => ({
    strokes: state.strokes.filter(s => s.id !== strokeId)
  })),
  
  addSystemRender: (render) => set((state) => ({
    systemRenders: [...state.systemRenders, render],
    shouldShowCanvas: true, // Trigger canvas to show when system render is added
  })),
  
  clearSystemRenders: () => set({ 
    systemRenders: [],
    // Note: Don't hide canvas here - let user control visibility
  }),
  
  removeSystemRender: (renderId) => set((state) => ({
    systemRenders: state.systemRenders.filter(r => r.id !== renderId)
  })),
  
  setCurrentTool: (tool) => set({ currentTool: tool }),
  
  setColor: (color) => set({ color }),
  
  setLocked: (locked) => set({ isLocked: locked }),
  
  // Step tracking
  createStep: (messageId) => {
    const state = get();
    const newStep = {
      stepNumber: state.steps.length + 1,
      messageId,
      systemRenders: [],
      timestamp: Date.now(),
      userStrokesSnapshot: [],
    };
    
    const updatedSteps = [...state.steps, newStep];
    
    set({
      steps: updatedSteps,
      currentStepIndex: state.steps.length,
    });
    
    console.log('📝 New step created:', newStep);
    console.log('📚 All steps:', updatedSteps);
    console.log('📍 Current step index:', state.steps.length);
    
    return newStep;
  },
  
  updateCurrentStepRenders: (renders) => {
    const state = get();
    if (state.currentStepIndex === -1) return;
    
    const updatedSteps = [...state.steps];
    updatedSteps[state.currentStepIndex] = {
      ...updatedSteps[state.currentStepIndex],
      systemRenders: renders,
    };
    
    set({ steps: updatedSteps });
  },
  
  // Unlock after system renders (auto-unlock after visualization)
  unlockAfterRender: () => {
    const state = get();
    if (state.systemRenders.length > 0 && state.isLocked) {
      set({ isLocked: false });
    }
  },
  
  // Lock when progressing to next step
  lockForNextStep: () => set({ isLocked: true }),
  
  // Manual control over canvas visibility
  setShouldShowCanvas: (show) => set({ shouldShowCanvas: show }),
  
  // Clear everything (user strokes + system renders)
  clearAll: () => set({ 
    strokes: [], 
    systemRenders: [],
    steps: [],
    currentStepIndex: -1,
    shouldShowCanvas: false,
  }),
}));

