import { create } from 'zustand';
import hardwareSocketService, { HardwareButtonEvent } from '../services/hardwareSocket';

interface HardwareSocketState {
  isConnected: boolean;
  lastEvent: HardwareButtonEvent | null;
  eventLogs: HardwareButtonEvent[];
  connect: () => void;
  disconnect: () => void;
  emitDevTestButton: (button: 'RED' | 'GREEN' | 'BLUE' | 'YELLOW') => void;
  clearLogs: () => void;
}

export const useHardwareSocketStore = create<HardwareSocketState>((set, get) => ({
  isConnected: false,
  lastEvent: null,
  eventLogs: [],

  connect: () => {
    const socket = hardwareSocketService.connect();
    
    set({ isConnected: socket.connected });

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    // Subscribe to hardware events
    hardwareSocketService.subscribe((event) => {
      set((state) => ({
        lastEvent: event,
        eventLogs: [event, ...state.eventLogs.slice(0, 49)],
      }));
    });
  },

  disconnect: () => {
    hardwareSocketService.disconnect();
    set({ isConnected: false });
  },

  emitDevTestButton: (button) => {
    hardwareSocketService.emitButtonPress(button);
  },

  clearLogs: () => set({ eventLogs: [], lastEvent: null }),
}));
