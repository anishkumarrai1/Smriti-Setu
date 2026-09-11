import { useEffect, useState, useCallback, useRef } from 'react';
import hardwareInputAdapter, {
  LogicalButton,
  LogicalButtonAction,
  HardwareActionListener,
} from '../services/hardwareInputAdapter';

export interface UseHardwareControlsOptions {
  onButtonPress?: (button: LogicalButton, action: LogicalButtonAction) => void;
  enabled?: boolean;
}

export function useHardwareControls(options: UseHardwareControlsOptions = {}) {
  const { onButtonPress, enabled = true } = options;
  const [lastAction, setLastAction] = useState<LogicalButtonAction | null>(null);
  
  // Keep callback reference updated without triggering re-subscriptions
  const callbackRef = useRef(onButtonPress);
  useEffect(() => {
    callbackRef.current = onButtonPress;
  }, [onButtonPress]);

  useEffect(() => {
    if (!enabled) return;

    // Ensure adapter service is initialized
    hardwareInputAdapter.initialize();

    const listener: HardwareActionListener = (action) => {
      setLastAction(action);
      if (callbackRef.current) {
        callbackRef.current(action.button, action);
      }
    };

    // Subscribe component listener
    const unsubscribe = hardwareInputAdapter.subscribe(listener);

    // Clean up listener on unmount
    return () => {
      unsubscribe();
    };
  }, [enabled]);

  const triggerDevButton = useCallback((button: LogicalButton) => {
    hardwareInputAdapter.dispatchAction(button, 'dev_panel');
  }, []);

  return {
    lastAction,
    triggerDevButton,
  };
}

export default useHardwareControls;
