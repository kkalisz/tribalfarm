import { useSetting } from '@src/shared/services/settingsStorage';

/**
 * Custom hook that encapsulates feature-specific settings
 * This hook abstracts away the setting keys and provides a more semantic interface
 */
export function useFeatureSettings() {
  // Use setting for auto scavenge feature
  const [autoScavenge, setAutoScavenge] = useSetting<boolean>('autoScavenge', false);

  return {
    autoScavenge: {
      enabled: autoScavenge,
      setEnabled: setAutoScavenge
    }
  };
}