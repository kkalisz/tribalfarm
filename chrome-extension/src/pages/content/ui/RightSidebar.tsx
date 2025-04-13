import React from "react";

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
            style={{ pointerEvents: 'auto' }}
        >
            <div className="p-4 relative">
                <button 
                    className="absolute top-2 left-2 bg-green-700 hover:bg-green-800 text-white font-bold py-1 px-2 rounded"
                    onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
                >
                    {rightSidebarVisible ? '▶' : '◀'}
                </button>

                {rightSidebarVisible ? (
                    <>
                        <h2 className="font-bold text-lg">Logs</h2>
                        <div className="mt-2 text-sm">
                            {logs.map((log, index) => (
                                <p key={index}>{log}</p>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="rotate-90 mt-20 whitespace-nowrap">Logs</div>
                )}
            </div>
        </div>
    );
};