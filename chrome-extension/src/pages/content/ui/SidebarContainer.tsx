import {executeCommand, setupDOMObserver} from "@pages/content";
import {useEffect, useState} from "react";
import {CommandMessage} from "@src/shared/types";

/** React Component for the Sidebar Views */
export const SidebarContainer = () => {
    const [currentCommand, setCurrentCommand] = useState<CommandMessage | null>(null);
    const [commandStatus, setCommandStatus] = useState<string>('idle');
    const [lastEvent, setLastEvent] = useState<string>('');
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        // Set up message listener for commands from service worker
        const messageListener = (message: any, sender: any, sendResponse: any) => {
            if (message.type === 'command') {
                console.log('Received command:', message);
                setCurrentCommand(message);
                setCommandStatus('in-progress');
                addLog(`Received command: ${message.payload.action}`);

                // Execute the command
                executeCommand(message)
                    .then(result => {
                        console.log(`Command executed: ${result.status}`);
                        setCommandStatus(result.status);
                        addLog(`Command executed: ${result.status}`);

                        // Send status update to service worker
                        chrome.runtime.sendMessage({
                            type: 'status',
                            actionId: message.actionId,
                            timestamp: new Date().toISOString(),
                            correlationId: message.correlationId,
                            payload: {
                                status: result.status,
                                details: result.details
                            }
                        });
                    })
                    .catch(error => {
                        console.error(`Command failed: ${error.message}`);
                        setCommandStatus('error');
                        addLog(`Command failed: ${error.message}`);

                        // Send error to service worker
                        chrome.runtime.sendMessage({
                            type: 'error',
                            actionId: message.actionId,
                            timestamp: new Date().toISOString(),
                            correlationId: message.correlationId,
                            payload: {
                                message: error.message,
                                details: error.details
                            }
                        });
                    });

                sendResponse({ status: 'processing' });
                return true;
            }
            return false;
        };

        chrome.runtime.onMessage.addListener(messageListener);

        // Announce that the content script is ready
        chrome.runtime.sendMessage({
            type: 'contentScriptReady',
            timestamp: new Date().toISOString()
        });

        // Set up beforeunload handler for page reloads
        window.addEventListener('beforeunload', () => {
            // Save state to sessionStorage
            sessionStorage.setItem('tribalFarmState', JSON.stringify({
                currentCommand,
                commandStatus,
                lastEvent,
                logs
            }));

            // Notify service worker about the unload
            chrome.runtime.sendMessage({
                type: 'event',
                actionId: currentCommand?.actionId || 'none',
                timestamp: new Date().toISOString(),
                payload: {
                    eventType: 'stateChange',
                    details: {
                        type: 'pageUnload'
                    }
                }
            });
        });

        // Check for saved state on load
        const savedState = sessionStorage.getItem('tribalFarmState');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                setCurrentCommand(parsed.currentCommand);
                setCommandStatus(parsed.commandStatus);
                setLastEvent(parsed.lastEvent);
                setLogs(parsed.logs || []);
                addLog('Restored state after page reload');
            } catch (e) {
                console.error('Failed to parse saved state:', e);
            }
        }

        // Set up DOM observer
        setupDOMObserver();

        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    return (
        <div
            className="fixed top-0 left-0 w-screen h-screen pointer-events-none"
            style={{ zIndex: 99999 }}
        >
            {/* Left Sidebar - Status */}
            <div
                className="fixed top-0 left-0 h-full w-1/4 bg-blue-500 bg-opacity-80 text-white overflow-scroll"
                style={{ pointerEvents: 'auto' }}
            >
                <div className="p-4">
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

            {/* Right Sidebar - Logs */}
            <div
                className="fixed top-0 right-0 h-full w-1/4 bg-green-500 bg-opacity-80 text-white overflow-auto"
                style={{ pointerEvents: 'auto' }}
            >
                <div className="p-4">
                    <h2 className="font-bold text-lg">Logs</h2>
                    <div className="mt-2 text-sm">
                        {logs.map((log, index) => (
                            <p key={index}>{log}</p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};