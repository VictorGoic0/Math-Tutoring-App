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
 */
export const useCanvasStore = create((set, get) => ({
  // User-drawn strokes
  strokes: [],
  
  // System-rendered content (equations, diagrams, annotations)
  systemRenders: [],
  
  // Current drawing tool ('pen' | 'eraser')
  currentTool: 'pen',
  
  // Current drawing color
  color: '#000000',
  
  // Whether drawing is locked (prevents user input)
  isLocked: true,
  
  // Actions
  addStroke: (stroke) => set((state) => ({
    strokes: [...state.strokes, stroke]
  })),
  
  clearStrokes: () => set({ strokes: [] }),
  
  removeStroke: (strokeId) => set((state) => ({
    strokes: state.strokes.filter(s => s.id !== strokeId)
  })),
  
  addSystemRender: (render) => set((state) => ({
    systemRenders: [...state.systemRenders, render]
  })),
  
  clearSystemRenders: () => set({ systemRenders: [] }),
  
  removeSystemRender: (renderId) => set((state) => ({
    systemRenders: state.systemRenders.filter(r => r.id !== renderId)
  })),
  
  setCurrentTool: (tool) => set({ currentTool: tool }),
  
  setColor: (color) => set({ color }),
  
  setLocked: (locked) => set({ isLocked: locked }),
  
  // Clear everything (user strokes + system renders)
  clearAll: () => set({ 
    strokes: [], 
    systemRenders: [] 
  }),
}));

