import { io, Socket } from 'socket.io-client';

export interface HardwareButtonEvent {
  type: 'BUTTON_PRESS';
  button: 'RED' | 'GREEN' | 'BLUE' | 'YELLOW';
  deviceId: string;
  timestamp: number;
}

export type HardwareEventListener = (event: HardwareButtonEvent) => void;

class HardwareSocketService {
  private socket: Socket | null = null;
  private listeners: Set<HardwareEventListener> = new Set();
  private isConnected: boolean = false;

  /**
   * Connects to the backend Socket.io hardware gateway.
   */
  public connect(serverUrl?: string): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    // Default to VITE_SOCKET_URL, serverUrl, or fallback to backend port 5000 on active hostname
    const envSocketUrl = (import.meta as any).env?.VITE_SOCKET_URL;
    const defaultHostUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000';
    const targetUrl = serverUrl || envSocketUrl || defaultHostUrl;


    console.log(`[HardwareSocket] 🔌 Connecting to Socket.io backend at: ${targetUrl}`);

    this.socket = io(targetUrl, {

      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log(`[HardwareSocket] 🟢 Connected to Socket.io server (${this.socket?.id})`);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`[HardwareSocket] 🔴 Disconnected from Socket.io server (${reason})`);
      this.isConnected = false;
    });

    this.socket.on('hardware:event', (event: HardwareButtonEvent) => {
      console.log(`[HardwareSocket] 📥 Hardware event received:`, event);
      this.listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (err) {
          console.error('[HardwareSocket] Error in event listener callback:', err);
        }
      });
    });

    return this.socket;
  }

  /**
   * Disconnects cleanly from the Socket.io server.
   */
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('[HardwareSocket] 🔌 Socket connection closed manually');
    }
  }

  /**
   * Subscribes a listener callback to normalized incoming hardware events.
   */
  public subscribe(listener: HardwareEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Development testing helper: Emits a hardware button press to backend.
   */
  public emitButtonPress(button: 'RED' | 'GREEN' | 'BLUE' | 'YELLOW', deviceId = 'ESP32-NER-GW-001') {
    if (this.socket && this.socket.connected) {
      this.socket.emit('hardware:button_press', {
        type: 'BUTTON_PRESS',
        button: button.toUpperCase(),
        deviceId,
        timestamp: Date.now(),
      });
    } else {
      console.warn('[HardwareSocket] Cannot emit button press: Socket disconnected');
    }
  }

  public getStatus(): { isConnected: boolean; socketId?: string } {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
    };
  }
}

export const hardwareSocketService = new HardwareSocketService();
export default hardwareSocketService;
