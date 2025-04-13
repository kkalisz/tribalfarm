import React from "react";
import {Transition} from "@headlessui/react";

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
            className={`fixed top-0 right-0 h-full bg-green-500 bg-opacity-80 text-white overflow-auto transition-all duration-300 ease-in-out ${rightSidebarVisible ? 'w-1/4' : 'w-10'}`}
            style={{pointerEvents: 'auto'}}
        >
            <div className="p-4">
                {/* Headless UI Button with better accessibility */}
                <button
                    className="top-2 left-2 bg-green-700 hover:bg-green-800 text-white font-bold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-green-300"
                    onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
                    aria-expanded={rightSidebarVisible}
                    aria-label={rightSidebarVisible ? "Collapse logs sidebar" : "Expand logs sidebar"}
                >
                    {rightSidebarVisible ? '▶' : '◀'}
                </button>

                {/* Transition for collapsed state */}
                <Transition
                    show={!rightSidebarVisible}
                    enter="transition-opacity duration-2000"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-2000"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="rotate-90 mt-20 whitespace-nowrap">Logs</div>
                </Transition>

                {/* Transition for expanded state */}
                <Transition
                    show={rightSidebarVisible}
                    enter="transition-opacity duration-2000"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-2000"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div>
                        <h2 className="font-bold text-lg">Logs</h2>
                        <div className="mt-2 text-sm">
                            {logs.map((log, index) => (
                                <p key={index}>{log}</p>
                            ))}
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
    );
};
