import { useState, useEffect } from "react";
import {
    getState, 
    subscribeToState, 
    addLog as addLogToState,
} from "@pages/content/execute/executor";

export const useCommandsData = () => {
    // Initialize state from the external state management
    const [state, setState] = useState(getState());

    useEffect(() => {
        // Subscribe to state changes
        const unsubscribe = subscribeToState(() => {
            setState(getState());
        });

        // No need to attach the executor here as it's already attached in index.tsx
        // when the content script loads

        // Cleanup on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    return {
        ...state,
        addLog: addLogToState
    };
};
