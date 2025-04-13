import React from "react";
import {CommandMessage} from "@src/shared/types";
import {Transition} from "@headlessui/react";

interface LeftSidebarProps {
    leftSidebarVisible: boolean;
    setLeftSidebarVisible: (visible: boolean) => Promise<void>;
    commandStatus: string;
    currentCommand: CommandMessage | null;
    lastEvent: string;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
                                                            leftSidebarVisible,
                                                            setLeftSidebarVisible,
                                                            commandStatus,
                                                            currentCommand,
                                                            lastEvent
                                                        }) => {
    return (
        <div className="fixed h-full top-0 left-0 w-1/4" style={{pointerEvents: 'auto'}}>
            {/* Toggle Button - Always visible in the same position */}
            <div className="absolute top-4 left-4">
                <button
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
                    aria-expanded={leftSidebarVisible}
                    aria-label={leftSidebarVisible ? "Collapse sidebar" : "Expand sidebar"}
                >
                    {leftSidebarVisible ? '◀' : '▶'}
                </button>
            </div>

            {/* Sidebar Content - Completely hidden when not visible */}
            {leftSidebarVisible && (
                <div 
                    className="h-full bg-blue-500 bg-opacity-80 text-white overflow-auto transition-all duration-300 ease-in-out w-full"
                >
                    <div className="p-4 mt-10">
                        <h2 className="font-bold text-lg">Tribal Farm Status</h2>
                        <div className="mt-2">
                            <p><strong>Status:</strong> {commandStatus}</p>
                            {currentCommand && (
                                <div className="mt-2">
                                    <p><strong>Current Command:</strong></p>
                                    <p>Action: {currentCommand.payload.action}</p>
                                    <p>ID: {currentCommand.actionId}</p>
                                </div>
                            )}
                            {lastEvent && (
                                <p className="mt-2"><strong>Last Event:</strong> {lastEvent}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
