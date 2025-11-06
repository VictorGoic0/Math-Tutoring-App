import { create } from 'zustand';

/**
 * Step Types Enum
 * Defines all possible render types that can be added to steps
 */
export const StepType = {
  EQUATION: 'equation',
  LABEL: 'label',
  DIAGRAM: 'diagram',
  CLEAR_CANVAS: 'clearCanvas',
};

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
  // This mirrors steps[currentStepIndex]
  systemRenders: [],
  
  // Step tracking for navigation
  // Each step is an array of render objects: [[render1, render2], [render3]]
  steps: [],
  currentStepIndex: 0, // Start at 0, not -1
  lastMessageId: null, // Track AI message IDs to detect new requests
  
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
  
  // Add render to current step (new architecture)
  addRenderToCurrentStep: (render, messageId) => {
    const state = get();
    
    // Check if this is a new AI request (different messageId)
    const isNewRequest = messageId && state.lastMessageId && messageId !== state.lastMessageId;
    
    if (isNewRequest) {
      // New request - create a new step
      console.log('📨 New AI request detected, creating new step');
      const newStep = [render];
      const updatedSteps = [...state.steps, newStep];
      
      set({
        steps: updatedSteps,
        currentStepIndex: updatedSteps.length - 1,
        systemRenders: [...newStep],
        lastMessageId: messageId,
        shouldShowCanvas: true,
      });
      
      console.log('➕ Added render to NEW step', updatedSteps.length - 1, ':', render.type);
    } else if (state.steps.length === 0) {
      // Auto-create step 0 if steps is empty
      console.log('🆕 Auto-creating step 0');
      const newStep = [render];
      
      set({
        steps: [newStep],
        currentStepIndex: 0,
        systemRenders: [...newStep],
        lastMessageId: messageId,
        shouldShowCanvas: true,
      });
      
      console.log('➕ Added render to step 0:', render.type);
    } else {
      // Add to current step
      const updatedSteps = [...state.steps];
      updatedSteps[state.currentStepIndex] = [
        ...updatedSteps[state.currentStepIndex],
        render
      ];
      
      set({
        steps: updatedSteps,
        systemRenders: [...updatedSteps[state.currentStepIndex]],
        lastMessageId: messageId,
        shouldShowCanvas: true,
      });
      
      console.log('➕ Added render to step', state.currentStepIndex, ':', render.type, 'Total in step:', updatedSteps[state.currentStepIndex].length);
    }
  },
  
  // Legacy function - keeping for backwards compatibility during transition
  addSystemRender: (render) => {
    console.warn('⚠️ addSystemRender is deprecated, use addRenderToCurrentStep instead');
    get().addRenderToCurrentStep(render, null);
  },
  
  // Add clearCanvas step
  addClearCanvasStep: (messageId) => {
    const state = get();
    const clearMarker = {
      id: `clear-${Date.now()}`,
      type: StepType.CLEAR_CANVAS,
      timestamp: Date.now()
    };
    
    const newStep = [clearMarker];
    const updatedSteps = [...state.steps, newStep];
    
    set({
      steps: updatedSteps,
      currentStepIndex: updatedSteps.length - 1,
      systemRenders: [...newStep],
      lastMessageId: messageId,
      shouldShowCanvas: true,
    });
    
    console.log('🧹 Created clearCanvas step', updatedSteps.length - 1);
  },
  
  // Legacy function - for clearing systemRenders without affecting steps
  clearSystemRenders: () => {
    console.warn('⚠️ clearSystemRenders is deprecated');
    set({ systemRenders: [] });
  },
  
  removeSystemRender: (renderId) => set((state) => ({
    systemRenders: state.systemRenders.filter(r => r.id !== renderId)
  })),
  
  setCurrentTool: (tool) => set({ currentTool: tool }),
  
  setColor: (color) => set({ color }),
  
  setLocked: (locked) => set({ isLocked: locked }),
  
  // DEPRECATED - Remove these old functions
  createStep: (messageId) => {
    console.warn('⚠️ createStep is deprecated, use addClearCanvasStep or addRenderToCurrentStep');
  },
  
  updateCurrentStepRenders: (renders) => {
    console.warn('⚠️ updateCurrentStepRenders is deprecated');
  },
  
  syncCurrentStepRenders: () => {
    console.warn('⚠️ syncCurrentStepRenders is deprecated');
  },
  
  // Navigation actions
  goToStep: (index) => {
    const state = get();
    if (index < 0 || index >= state.steps.length) {
      console.warn('⚠️ Invalid step index:', index);
      return;
    }
    
    const step = state.steps[index];
    if (!step) return;
    
    // Check if this is a clearCanvas step
    const isClearStep = step.some(r => r.type === StepType.CLEAR_CANVAS);
    
    console.log('📍 Navigating to step', index, isClearStep ? '(clear)' : '(renders)');
    
    set({
      currentStepIndex: index,
      systemRenders: [...step], // Mirror the step
    });
  },
  
  goToNextStep: () => {
    const state = get();
    if (state.currentStepIndex < state.steps.length - 1) {
      const nextIndex = state.currentStepIndex + 1;
      get().goToStep(nextIndex);
    }
  },
  
  goToPreviousStep: () => {
    const state = get();
    if (state.currentStepIndex > 0) {
      const prevIndex = state.currentStepIndex - 1;
      get().goToStep(prevIndex);
    }
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
  
  // Clear everything (user strokes + system renders + steps)
  clearAll: () => set({ 
    strokes: [], 
    systemRenders: [],
    steps: [],
    currentStepIndex: 0, // Start at 0, not -1
    lastMessageId: null,
    shouldShowCanvas: false,
  }),
}));

