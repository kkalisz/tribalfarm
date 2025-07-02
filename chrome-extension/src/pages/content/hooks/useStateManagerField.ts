import { useEffect, useState, useCallback } from "react";
import { StateManager } from '@pages/content/execute/StateManager';

export function useStateManagerField<K extends keyof ReturnType<StateManager['getState']>>(
  stateManager: StateManager,
  field: K
): [ReturnType<StateManager['getState']>[K], (value: ReturnType<StateManager['getState']>[K]) => void] {
  // Initialize the state with the current value of the field
  const [value, setValue] = useState(() => stateManager.getState()[field]);

  // Effect to handle subscriptions to the StateManager for the specific field
  useEffect(() => {
    const unsubscribe = stateManager.subscribeToField(field, (newValue) => {
      setValue(newValue); // Update the local state whenever the field changes
    });

    return () => {
      unsubscribe();
    };
  }, [stateManager, field]);

  // Define a setter that updates the field using StateManager's `setField`
  const updateFieldValue = useCallback(
    (newValue: ReturnType<StateManager['getState']>[K]) => {
      stateManager.setField(field, newValue);
    },
    [stateManager, field]
  );

  return [value, updateFieldValue];
}