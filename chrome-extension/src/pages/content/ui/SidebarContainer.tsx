import {setupDOMObserver} from "@pages/content";
import {useEffect} from "react";
import {useCommandsData} from "@pages/content/hooks/useCommandsData";
import {LeftSidebar} from "@pages/content/ui/LeftSidebar";
import {RightSidebar} from "@pages/content/ui/RightSidebar";
import {useGuiSettings} from "@src/shared/hooks/useGuiSettings";

/** React Component for the Sidebar Views */
export const SidebarContainer = () => {
    // Use custom hook for command data
    const {
        currentCommand,
        commandStatus,
        lastEvent,
        logs
    } = useCommandsData();

    // Use custom hook for GUI settings
    const { leftSidebar, rightSidebar, gui } = useGuiSettings();

    useEffect(() => {
        // Set up DOM observer
        setupDOMObserver();
    }, []);

    // Always render the container div to keep the logic running
    return (
        <div
            className="fixed top-0 left-0 w-screen h-screen pointer-events-none"
            style={{ zIndex: 99999 }}
        >
            {/* Only render the UI components if showGUI is true */}
            {gui.visible && (
                <>
                    {/* Left Sidebar - Status */}
                    <LeftSidebar
                        leftSidebarVisible={leftSidebar.visible}
                        setLeftSidebarVisible={leftSidebar.setVisible}
                        commandStatus={commandStatus}
                        currentCommand={currentCommand}
                        lastEvent={lastEvent}
                    />

                    {/* Right Sidebar - Logs */}
                    <RightSidebar
                        rightSidebarVisible={rightSidebar.visible}
                        setRightSidebarVisible={rightSidebar.setVisible}
                        logs={logs}
                    />
                </>
            )}
        </div>
    );
};
