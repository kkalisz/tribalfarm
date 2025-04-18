import { useSetting } from '@src/shared/services/settingsStorage';

export function usePluginSettings() {
  // Use settings for sidebar visibility
  const [isPluginEnabled, setIsPluginEnabled] = useSetting<boolean>('isPluginEnabled', true);

  return {
    plugin: {
      visible: isPluginEnabled,
      setVisible: setIsPluginEnabled,
    },
  };
}