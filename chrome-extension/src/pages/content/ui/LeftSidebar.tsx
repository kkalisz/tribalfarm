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
        <div
            className={`fixed top-0 left-0 h-full bg-blue-500 bg-opacity-80 text-white overflow-scroll transition-all duration-300 ease-in-out ${leftSidebarVisible ? 'w-1/4' : 'w-10'}`}
            style={{pointerEvents: 'auto'}}
        >
            <div className="p-4">
                {/* Headless UI Button with better accessibility */}
                <button
                    className="top-2 right-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
                    aria-expanded={leftSidebarVisible}
                    aria-label={leftSidebarVisible ? "Collapse sidebar" : "Expand sidebar"}
                >
                    {leftSidebarVisible ? '◀' : '▶'}
                </button>

                {/* Transition for collapsed state */}
                <Transition
                    show={!leftSidebarVisible}
                    enter="transition-opacity duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="rotate-90 mt-20 whitespace-nowrap">Tribal Farm Status</div>
                </Transition>

                {/* Transition for expanded state */}
                <Transition
                    show={leftSidebarVisible}
                    enter="transition-opacity duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div>
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
                </Transition>
            </div>
        </div>
    );
};
