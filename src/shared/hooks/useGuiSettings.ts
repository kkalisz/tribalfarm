import { useSetting } from '@src/shared/services/settingsStorage';

/**
 * Custom hook that encapsulates GUI visibility settings
 * This hook abstracts away the setting keys and provides a more semantic interface
 */
export function useGuiSettings() {
  // Use settings for sidebar visibility
  const [leftSidebarVisible, setLeftSidebarVisible] = useSetting<boolean>('leftSidebarVisible', false);
  const [rightSidebarVisible, setRightSidebarVisible] = useSetting<boolean>('rightSidebarVisible', false);
  // Use setting for global GUI visibility
  const [showGUI, setShowGUI] = useSetting<boolean>('showGUI', true);

  return {
    leftSidebar: {
      visible: leftSidebarVisible,
      setVisible: setLeftSidebarVisible
    },
    rightSidebar: {
      visible: rightSidebarVisible,
      setVisible: setRightSidebarVisible
    },
    gui: {
      visible: showGUI,
      setVisible: setShowGUI
    }
  };
}