import React from "react";
import {Transition} from "@headlessui/react";
import {SidebarToggleButton} from "@pages/content/ui/SidebarToggleButton";
import TribalCard from "@src/shared/ui/TribalCard";

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
            style={{pointerEvents: rightSidebarVisible ? "auto" : "none"}}
        >
            <div className="p-2 flex flex-row justify-end" style={{pointerEvents: "auto"}}>
                <SidebarToggleButton
                    isVisible={rightSidebarVisible}
                    onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
                    position="right"
                />
            </div>

            {/* Sidebar Content - Completely hidden when not visible */}
            {rightSidebarVisible && (
                <div
                    className="h-full text-white overflow-auto"
                    style={{pointerEvents: 'auto'}}
                >
                    <TribalCard className="p-4 mt-10">
                        <h2 className="font-bold text-lg">Logs</h2>
                        <div className="mt-2 text-sm">
                            {logs.map((log, index) => (
                                <p key={index}>{log}</p>
                            ))}
                        </div>
                    </TribalCard>
                </div>
            )}
        </div>
    );
};
