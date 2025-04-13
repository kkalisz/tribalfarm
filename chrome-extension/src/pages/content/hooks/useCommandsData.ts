import { useState, useEffect } from "react";
import { CommandMessage } from "@src/shared/types";
import { executeCommand } from "@pages/content";

export const useCommandsData = () => {
    const [currentCommand, setCurrentCommand] = useState<CommandMessage | null>(null);
    const [commandStatus, setCommandStatus] = useState<string>('idle');
    const [lastEvent, setLastEvent] = useState<string>('');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

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

        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    return {
        currentCommand,
        commandStatus,
        lastEvent,
        logs,
        addLog
    };
};