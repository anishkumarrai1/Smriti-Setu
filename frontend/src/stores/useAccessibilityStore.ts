import { create } from 'zustand';

export interface AccessibilitySettings {
  elderlyMode: boolean;
  fontSizeScale: number;
  speechAssistEnabled: boolean;
  reducedMotion: boolean;
}

interface AccessibilityState extends AccessibilitySettings {
  toggleElderlyMode: () => void;
  setFontSizeScale: (scale: number) => void;
  toggleSpeechAssist: () => void;
  toggleReducedMotion: () => void;
}

const updateDOMAccessibility = (state: AccessibilitySettings) => {
  if (typeof document !== 'undefined') {
    // Dynamically scale root HTML font size (scales all rem units in Tailwind CSS)
    document.documentElement.style.fontSize = `${state.fontSizeScale * 100}%`;

    // Toggle elderly-mode class
    if (state.elderlyMode) {
      document.documentElement.classList.add('elderly-mode');
      document.body.classList.add('elderly-mode');
    } else {
      document.documentElement.classList.remove('elderly-mode');
      document.body.classList.remove('elderly-mode');
    }
  }
};

const initialState: AccessibilitySettings = {
  elderlyMode: true,
  fontSizeScale: 1.15,
  speechAssistEnabled: true,
  reducedMotion: true,
};

export const useAccessibilityStore = create<AccessibilityState>((set) => ({
  ...initialState,

  toggleElderlyMode: () =>
    set((state) => {
      const nextMode = !state.elderlyMode;
      return {
        elderlyMode: nextMode,
        fontSizeScale: nextMode ? 1.15 : 1.0,
        reducedMotion: nextMode ? true : state.reducedMotion,
        speechAssistEnabled: nextMode ? true : state.speechAssistEnabled,
      };
    }),

  setFontSizeScale: (fontSizeScale) => set({ fontSizeScale }),
  toggleSpeechAssist: () => set((state) => ({ speechAssistEnabled: !state.speechAssistEnabled })),
  toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
}));

// Apply initial DOM accessibility settings
updateDOMAccessibility(initialState);

// Subscribe to store changes to keep DOM accessibility perfectly in sync
useAccessibilityStore.subscribe((state) => {
  updateDOMAccessibility(state);
});
