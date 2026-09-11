import hardwareSocketService, { HardwareButtonEvent } from './hardwareSocket';

export type LogicalButton = 'RED' | 'GREEN' | 'BLUE' | 'YELLOW';
export type InputSource = 'esp32' | 'keyboard' | 'dev_panel';

export interface LogicalButtonAction {
  button: LogicalButton;
  source: InputSource;
  timestamp: number;
  deviceId?: string;
}

export type HardwareActionListener = (action: LogicalButtonAction) => void;

class HardwareInputAdapterService {
  private listeners: Set<HardwareActionListener> = new Set();
  private isKeyboardListening: boolean = false;
  private socketUnsubscribe: (() => void) | null = null;
  private lastAction: LogicalButtonAction | null = null;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSocketEvent = this.handleSocketEvent.bind(this);
  }

  /**
   * Initializes input adapter, listening to both Socket.io ESP32 events & keyboard shortcuts.
   */
  public initialize(): void {
    // 1. Subscribe to Socket.io ESP32 events
    if (!this.socketUnsubscribe) {
      this.socketUnsubscribe = hardwareSocketService.subscribe(this.handleSocketEvent);
    }

    // 2. Attach global keyboard event listener for development testing
    if (typeof window !== 'undefined' && !this.isKeyboardListening) {
      window.addEventListener('keydown', this.handleKeyDown);
      this.isKeyboardListening = true;
      console.log('[HardwareInputAdapter] 🎮 Keyboard bindings active (Keys 1=RED, 2=GREEN, 3=BLUE, 4=YELLOW)');
    }
  }

  /**
   * Cleans up all event listeners.
   */
  public destroy(): void {
    if (this.socketUnsubscribe) {
      this.socketUnsubscribe();
      this.socketUnsubscribe = null;
    }

    if (typeof window !== 'undefined' && this.isKeyboardListening) {
      window.removeEventListener('keydown', this.handleKeyDown);
      this.isKeyboardListening = false;
      console.log('[HardwareInputAdapter] 🛑 Keyboard bindings deactivated');
    }
  }

  /**
   * Subscribes a callback to normalized logical button actions.
   */
  public subscribe(listener: HardwareActionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Manually emit a logical button action (for testing / dev tools).
   */
  public dispatchAction(button: LogicalButton, source: InputSource = 'dev_panel', deviceId?: string): void {
    const action: LogicalButtonAction = {
      button,
      source,
      timestamp: Date.now(),
      deviceId,
    };
    this.lastAction = action;
    console.log(`[HardwareInputAdapter] ⚡ Logical Button Action: ${action.button} (Source: ${action.source})`);

    this.listeners.forEach((listener) => {
      try {
        listener(action);
      } catch (err) {
        console.error('[HardwareInputAdapter] Error in listener callback:', err);
      }
    });
  }

  public getLastAction(): LogicalButtonAction | null {
    return this.lastAction;
  }

  /**
   * Handles incoming Socket.io ESP32 button press events.
   */
  private handleSocketEvent(event: HardwareButtonEvent): void {
    if (event.type === 'BUTTON_PRESS' && event.button) {
      const normalizedButton = event.button.toUpperCase() as LogicalButton;
      if (['RED', 'GREEN', 'BLUE', 'YELLOW'].includes(normalizedButton)) {
        this.dispatchAction(normalizedButton, 'esp32', event.deviceId);
      }
    }
  }

  /**
   * Handles physical keyboard dev testing inputs (Keys 1, 2, 3, 4).
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // Ignore input events when user is typing in text fields/inputs
    const activeEl = document.activeElement;
    const isTyping =
      activeEl &&
      (activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable);

    if (isTyping) return;

    let targetButton: LogicalButton | null = null;
    if (e.key === '1') targetButton = 'RED';
    else if (e.key === '2') targetButton = 'GREEN';
    else if (e.key === '3') targetButton = 'BLUE';
    else if (e.key === '4') targetButton = 'YELLOW';

    if (targetButton) {
      e.preventDefault();
      this.dispatchAction(targetButton, 'keyboard');
    }
  }
}

export const hardwareInputAdapter = new HardwareInputAdapterService();
export default hardwareInputAdapter;
