// @/store/useAnimationStore.ts
import { create } from 'zustand';

interface AnimationStore {
  isFlying: boolean;
  startCoords: { x: number; y: number } | null;
  endCoords: { x: number; y: number } | null;
  
  // Triggers the animation from a specific point
  triggerFlyToCart: (startX: number, startY: number) => void;
  
  // Set by the Header component on mount
  setEndCoords: (x: number, y: number) => void;
  
  // Reset the animation state
  resetFlight: () => void;
}

export const useAnimationStore = create<AnimationStore>((set, get) => ({
  isFlying: false,
  startCoords: null,
  endCoords: null,

  triggerFlyToCart: (startX, startY) => {
    // Only trigger if we know where we're going
    if (!get().endCoords) {
      console.warn("Header cart coordinates not set yet.");
      return;
    }
    
    set({
      isFlying: true,
      startCoords: { x: startX, y: startY },
    });
  },

  setEndCoords: (x, y) => set({ endCoords: { x, y } }),

  resetFlight: () => set({ isFlying: false, startCoords: null }),
}));