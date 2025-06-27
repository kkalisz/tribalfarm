import {LeftSidebar} from "@pages/content/ui/LeftSidebar";
import {RightSidebar} from "@pages/content/ui/RightSidebar";
import {useGuiSettings} from "@src/shared/hooks/useGuiSettings";
import { Box } from "@chakra-ui/react";

/** React Component for the Sidebar Views */
export const SidebarContainer = () => {
    // Use custom hook for command data
    const {
        currentCommand,
        logs
    } = useCommandsData();

    // Use custom hook for GUI settings
    const { leftSidebar, rightSidebar, gui } = useGuiSettings();

    // Always render the container to keep the logic running
    return (
        <Box
            position="fixed"
            top="0"
            left="0"
            width="100vw"
            height="100vh"
            pointerEvents="none"
            zIndex={99999}
        >
            {/* Only render the UI components if showGUI is true */}
            {gui.visible && (
                <>
                    {/* Left Sidebar - Status */}
                    <LeftSidebar
                        leftSidebarVisible={leftSidebar.visible}
                        setLeftSidebarVisible={leftSidebar.setVisible}
                        currentCommand={currentCommand}
                    />

                    {/* Right Sidebar - Logs */}
                    <RightSidebar
                        rightSidebarVisible={rightSidebar.visible}
                        setRightSidebarVisible={rightSidebar.setVisible}
                        logs={logs}
                    />
                </>
            )}
        </Box>
    );
};
