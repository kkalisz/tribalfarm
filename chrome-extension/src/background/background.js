// Constants
const WS_URL = 'ws://localhost:8080';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000; // 1 second
const STORAGE_KEY = 'tribalFarmState';

// State management
const initialState = {
    authToken: null,
    user: null,
    isConnected: false,
    lastError: null
};

let currentState = { ...initialState };
let ws = null;
let reconnectAttempts = 0;

// Load state from storage
async function loadState() {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    if (result[STORAGE_KEY]) {
        currentState = { ...initialState, ...result[STORAGE_KEY] };
        if (currentState.authToken) {
            connectWebSocket();
        }
    }
}

// Save state to storage
async function saveState() {
    await chrome.storage.local.set({ [STORAGE_KEY]: currentState });
}

// Update state and notify listeners
function updateState(updates) {
    currentState = { ...currentState, ...updates };
    saveState();
    // Notify popup about state changes
    chrome.runtime.sendMessage({ type: 'state_updated', state: currentState });
}

// Connect to WebSocket server
function connectWebSocket() {
    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
        return;
    }

    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts = 0;
        updateState({ isConnected: true, lastError: null });

        // If we have an auth token, authenticate immediately
        if (currentState.authToken) {
            sendMessage({
                type: 'authenticate',
                token: currentState.authToken
            });
        }
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected');
        ws = null;
        updateState({ isConnected: false });

        // Attempt to reconnect
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            setTimeout(connectWebSocket, RECONNECT_DELAY * reconnectAttempts);
        } else {
            updateState({ lastError: 'Failed to connect to server after multiple attempts' });
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateState({ lastError: 'WebSocket connection error' });
    };

    ws.onmessage = (event) => {
        handleMessage(JSON.parse(event.data));
    };
}

// Handle incoming messages
function handleMessage(message) {
    switch (message.type) {
        case 'auth_success':
            console.log('Authentication successful');
            updateState({
                user: message.user,
                lastError: null
            });
            break;

        case 'auth_error':
            console.error('Authentication failed:', message.error);
            updateState({
                user: null,
                authToken: null,
                lastError: message.error
            });
            break;

        default:
            console.log('Received message:', message);
            // Forward message to popup or content script if needed
            chrome.runtime.sendMessage(message);
    }
}

// Send message to WebSocket server
function sendMessage(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    } else {
        console.error('WebSocket is not connected');
        updateState({ lastError: 'WebSocket is not connected' });
    }
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'login':
            // Store auth token and connect/authenticate WebSocket
            updateState({
                authToken: message.token,
                lastError: null
            });
            if (!ws) {
                connectWebSocket();
            } else {
                sendMessage({
                    type: 'authenticate',
                    token: message.token
                });
            }
            break;

        case 'logout':
            // Clear state and close WebSocket
            updateState({
                authToken: null,
                user: null,
                lastError: null
            });
            if (ws) {
                ws.close();
            }
            break;

        case 'get_state':
            // Return current state to caller
            sendResponse(currentState);
            return true;

        case 'send_message':
            // Forward message to WebSocket server
            sendMessage(message.data);
            break;
    }
});

// Initialize state and connection
loadState().then(() => {
    console.log('State loaded:', currentState);
    if (currentState.authToken) {
        connectWebSocket();
    }
});

// Reconnect when the extension comes online
chrome.runtime.onStartup.addListener(() => {
    loadState().then(() => {
        if (currentState.authToken) {
            connectWebSocket();
        }
    });
});
