import { create } from "zustand";

export interface TimeState {
  /** Whether the simulation clock is running */
  playing: boolean;
  /** Speed multiplier (1 = real-time-ish, 0 = paused, negative = reverse) */
  speed: number;
  /** Accumulated simulation time in seconds */
  elapsedTime: number;
  /** Advance the clock by `delta` seconds (scaled by speed). Call once per frame. */
  tick: (delta: number) => void;
  /** Set the speed multiplier */
  setSpeed: (speed: number) => void;
  /** Toggle play / pause */
  togglePlaying: () => void;
  /** Explicitly set playing state */
  setPlaying: (playing: boolean) => void;
  /** Reset elapsed time to zero */
  reset: () => void;
}

export const useTimeStore = create<TimeState>((set, get) => ({
  playing: true,
  speed: 1,
  elapsedTime: 0,

  tick: (delta: number) => {
    const { playing, speed, elapsedTime } = get();
    if (playing) {
      set({ elapsedTime: elapsedTime + delta * speed });
    }
  },

  setSpeed: (speed: number) => set({ speed }),

  togglePlaying: () => set((s) => ({ playing: !s.playing })),

  setPlaying: (playing: boolean) => set({ playing }),

  reset: () => set({ elapsedTime: 0 }),
}));
