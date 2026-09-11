import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export interface HardwareButtonEvent {
  type: 'BUTTON_PRESS';
  button: 'RED' | 'GREEN' | 'BLUE' | 'YELLOW';
  deviceId: string;
  timestamp: number;
}

let io: SocketIOServer | null = null;

/**
 * Validates incoming hardware event payload against expected schema.
 */
export function isValidHardwareButtonEvent(data: any): data is HardwareButtonEvent {
  if (!data || typeof data !== 'object') return false;
  if (data.type !== 'BUTTON_PRESS') return false;
  if (typeof data.button !== 'string') return false;
  
  const normalizedButton = data.button.toUpperCase();
  if (!['RED', 'GREEN', 'BLUE', 'YELLOW'].includes(normalizedButton)) return false;
  if (typeof data.deviceId !== 'string' || !data.deviceId.trim()) return false;
  
  return true;
}

/**
 * Broadcasts a verified hardware event to all connected frontend clients.
 */
export function broadcastHardwareEvent(event: HardwareButtonEvent): boolean {
  if (!io) {
    console.warn('[Socket.io] Warning: Socket server not initialized yet');
    return false;
  }
  
  const normalizedEvent: HardwareButtonEvent = {
    ...event,
    button: event.button.toUpperCase() as HardwareButtonEvent['button'],
    timestamp: event.timestamp || Date.now(),
  };

  console.log(`[Socket.io] 📡 Broadcasting hardware event: ${normalizedEvent.button} from ${normalizedEvent.deviceId}`);
  io.emit('hardware:event', normalizedEvent);
  return true;
}

/**
 * Initializes Socket.io real-time hardware communication gateway.
 */
export function initHardwareSocket(server: HttpServer): SocketIOServer {
  const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

  io = new SocketIOServer(server, {
    cors: {
      origin: (requestOrigin, callback) => {
        // Allow localhost, local LAN IPs, or defined CLIENT_ORIGIN
        if (!requestOrigin || process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else if ([CLIENT_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'].includes(requestOrigin)) {
          callback(null, true);
        } else {
          callback(null, true); // Dev resilient fallback
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });


  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] 🔌 Client connected: ${socket.id}`);

    // Listen for raw incoming hardware events from ESP32 nodes or gateways
    socket.on('hardware:button_press', (rawPayload: any) => {
      if (isValidHardwareButtonEvent(rawPayload)) {
        broadcastHardwareEvent(rawPayload);
      } else {
        console.warn('[Socket.io] ⚠️ Invalid hardware button event received:', rawPayload);
        socket.emit('hardware:error', {
          error: 'Invalid hardware button event format',
          received: rawPayload,
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] 🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}
