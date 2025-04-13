import React from "react";
import {Transition} from "@headlessui/react";
import {SidebarToggleButton} from "@pages/content/ui/SidebarToggleButton";

interface RightSidebarProps {
    rightSidebarVisible: boolean;
    setRightSidebarVisible: (visible: boolean) => Promise<void>;
    logs: string[];
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
                                                              rightSidebarVisible,
                                                              setRightSidebarVisible,
                                                              logs
                                                          }) => {
    return (
        <div
            className={`fixed top-0 right-0 h-full overflow-auto w-1/4`}
            style={{pointerEvents: rightSidebarVisible ? 'auto' : 'none'}}
        >
            <div className="absolute top-4 right-20">
                <SidebarToggleButton
                    isVisible={rightSidebarVisible}
                    onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
                    position="right"
                />
            </div>

            {/* Sidebar Content - Completely hidden when not visible */}
            {rightSidebarVisible && (
                <div
                    className="h-full bg-green-500 bg-opacity-80 text-white overflow-auto transition-all duration-300 ease-in-out w-full"
                >
                    <div className="p-4 mt-10">
                        <h2 className="font-bold text-lg">Logs</h2>
                        <div className="mt-2 text-sm">
                            {logs.map((log, index) => (
                                <p key={index}>{log}</p>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
