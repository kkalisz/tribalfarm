# Tribal Farm Implementation Plan

## Overview
We are building a **browser extension** to automate interactions with a browser-based game (similar to TribalWars). The extension communicates with a **backend server via WebSocket**. The game reloads the page after each action, so the extension must be resilient to full page reloads and loss of in-memory state.
This implementation plan outlines the steps needed to complete the browser extension automation system for interacting with a browser-based game. The system consists of two main components:
1. A Chrome extension that interacts with the game
2. A backend server that communicates with the extension via WebSocket
3. Backed server should be able to handle multiple extension instances
4. Backend module is places in backend folder, extension module is placed in chrome-extension folder
5. If we can use external dependencies to simplify work let use them
6. we should have tests for parts that are possible to test

## Implementation Tasks

### Phase 1: Foundation Setup

#### Chrome Extension Core
- [x] Update manifest.json with required permissions
  - Add `storage`, `scripting`, `webRequest` permissions
  - Add background service worker entry point
- [x] Implement basic message types and interfaces
  - Create message types matching the communication protocol
  - Implement type definitions for commands, status updates, events
- [x] Set up communication channels between components
  - Implement message passing between content script and service worker

#### Backend Core
- [ ] Update WebSocket message structure
  - Implement the message protocol with `type`, `actionId`, `payload`, `timestamp`, `correlationId`
  - Create serializers/deserializers for all message types
- [ ] Implement basic command handling
  - Set up command routing infrastructure
  - Implement basic command validation

### Phase 2: Core Functionality

#### Service Worker Implementation
- [x] Implement WebSocket connection management
  - Create persistent connection to backend
  - Implement reconnection with exponential backoff
  - Add connection status tracking
- [x] Implement command queue management
  - Create storage for pending and in-progress commands
  - Implement command tracking with status updates
  - Add command retry logic
- [x] Implement content script communication
  - Add message routing to active tabs
  - Implement tab tracking for multi-window support

#### Content Script Implementation
- [x] Implement DOM parsing functionality
  - Create selectors for game elements
  - Implement state extraction from DOM
  - Add validation for expected page structure
- [x] Implement UI action execution
  - Create functions for clicks, inputs, form submissions
  - Add validation for action results
  - Implement error detection
- [x] Implement page reload handling
  - Add `beforeunload` event listener
  - Implement state persistence in `sessionStorage`
  - Add reconnection logic after page reload

#### Backend Implementation
- [ ] Implement client session management
  - Track connected clients with unique identifiers
  - Implement client capability discovery
- [ ] Implement command dispatching
  - Create command queue per client
  - Add command status tracking
  - Implement timeout and retry logic
- [ ] Implement status handling
  - Process status updates from clients
  - Implement error handling and recovery strategies

### Phase 3: Advanced Features

#### Error Handling and Recovery
- [ ] Implement comprehensive error detection
  - Add detection for validation failures
  - Implement popup/modal detection
  - Create error classification system
- [ ] Implement recovery strategies
  - Add retry logic with backoff
  - Implement alternative action paths
  - Create fallback mechanisms

#### State Management
- [ ] Implement robust state tracking
  - Create state persistence across page reloads
  - Implement command resumption after interruption
  - Add state synchronization between components

#### Debugging and Monitoring
- [ ] Implement debugging UI
  - Create extension popup with status display
  - Add command history and inspection
  - Implement manual override controls
- [ ] Add comprehensive logging
  - Implement structured logging
  - Add performance metrics
  - Create diagnostic tools

### Phase 4: Testing and Refinement

#### Testing
- [ ] Implement automated tests
  - Create unit tests for core components
  - Implement integration tests for end-to-end flows
  - Add stress tests for reliability
- [ ] Perform manual testing
  - Test with different game scenarios
  - Verify error handling and recovery
  - Validate performance under load

#### Refinement
- [ ] Optimize performance
  - Reduce message size and frequency
  - Improve DOM parsing efficiency
  - Optimize WebSocket usage
- [ ] Enhance reliability
  - Improve error recovery
  - Add circuit breakers for failing operations
  - Implement graceful degradation

## Priority Order

1. **Foundation Setup** - These tasks establish the basic structure and communication channels
2. **Service Worker Implementation** - The service worker is the central component that maintains state and connections
3. **Content Script Core Functionality** - Basic DOM interaction and action execution
4. **Backend Command Handling** - Command dispatching and status tracking
5. **Error Handling and Recovery** - Ensuring the system can handle failures gracefully
6. **State Management** - Maintaining state across page reloads and interruptions
7. **Advanced Features** - Additional functionality for better user experience
8. **Testing and Refinement** - Ensuring reliability and performance

## Detailed Implementation Steps

### 1. Update manifest.json

```json
{
  "manifest_version": 3,
  "name": "Tribal Farm Automation",
  "description": "Automates interactions with browser-based game",
  "permissions": [
    "activeTab",
    "storage",
    "scripting",
    "webRequest"
  ],
  "background": {
    "service_worker": "src/pages/background/index.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["https://*.plemiona.pl/*"],
      "js": ["src/pages/content/index.tsx"]
    }
  ]
}
```

### 2. Implement Message Types

Create shared type definitions in a new file `chrome-extension/src/shared/types.ts`:

```typescript
export interface BaseMessage {
  type: 'command' | 'status' | 'event' | 'error' | 'ack';
  actionId: string;
  timestamp: string;
  correlationId?: string;
}

export interface CommandMessage extends BaseMessage {
  type: 'command';
  payload: {
    action: string;
    parameters: Record<string, any>;
  };
}

export interface StatusMessage extends BaseMessage {
  type: 'status';
  payload: {
    status: 'in-progress' | 'done' | 'error' | 'interrupted';
    details?: Record<string, any>;
  };
}

export interface EventMessage extends BaseMessage {
  type: 'event';
  payload: {
    eventType: 'popup' | 'modal' | 'validation' | 'stateChange';
    details: Record<string, any>;
  };
}

export interface ErrorMessage extends BaseMessage {
  type: 'error';
  payload: {
    message: string;
    code?: string;
    details?: Record<string, any>;
  };
}

export interface AckMessage extends BaseMessage {
  type: 'ack';
  payload: {
    received: string;
  };
}

export type Message = CommandMessage | StatusMessage | EventMessage | ErrorMessage | AckMessage;
```

### 3. Implement Service Worker

Update `chrome-extension/src/pages/background/index.ts`:

```typescript
import { Message, CommandMessage, StatusMessage } from '../../shared/types';

// Connection state
let socket: WebSocket | null = null;
let reconnectAttempts = 0;
let isConnecting = false;
const maxReconnectDelay = 30000; // 30 seconds

// Command state
let currentCommand: CommandMessage | null = null;
let commandQueue: CommandMessage[] = [];
let activeTabId: number | null = null;

// Connect to WebSocket server
function connectWebSocket() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    console.log('WebSocket already connected or connecting');
    return;
  }

  if (isConnecting) {
    console.log('Connection already in progress');
    return;
  }

  isConnecting = true;
  const backendUrl = 'ws://localhost:8080/ws'; // Configure as needed

  console.log(`Connecting to WebSocket at ${backendUrl}`);
  socket = new WebSocket(backendUrl);

  socket.onopen = () => {
    console.log('WebSocket connection established');
    isConnecting = false;
    reconnectAttempts = 0;

    // Process any queued commands
    processCommandQueue();
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data) as Message;
      handleIncomingMessage(message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  socket.onclose = (event) => {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    socket = null;
    isConnecting = false;

    // Schedule reconnection with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), maxReconnectDelay);
    reconnectAttempts++;

    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
    setTimeout(connectWebSocket, delay);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    // The onclose handler will be called after this
  };
}

// Handle incoming messages from the WebSocket
function handleIncomingMessage(message: Message) {
  console.log('Received message:', message);

  switch (message.type) {
    case 'command':
      // Store the command and forward to content script
      currentCommand = message;
      forwardCommandToContentScript(message);
      break;

    case 'ack':
      // Handle acknowledgment
      console.log('Command acknowledged:', message.actionId);
      break;

    default:
      console.log('Unhandled message type:', message.type);
  }
}

// Forward command to the active content script
function forwardCommandToContentScript(command: CommandMessage) {
  if (!activeTabId) {
    console.log('No active tab, queuing command');
    commandQueue.push(command);
    return;
  }

  chrome.tabs.sendMessage(activeTabId, command)
    .then(response => {
      console.log('Command forwarded to content script, response:', response);
    })
    .catch(error => {
      console.error('Error forwarding command to content script:', error);
      commandQueue.push(command);
    });
}

// Process the command queue
function processCommandQueue() {
  if (commandQueue.length === 0 || !activeTabId || !socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }

  while (commandQueue.length > 0) {
    const command = commandQueue.shift();
    if (command) {
      forwardCommandToContentScript(command);
    }
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message from content script:', message, 'Sender:', sender);

  // Track the active tab
  if (sender.tab && sender.tab.id) {
    activeTabId = sender.tab.id;
  }

  // Handle different message types
  if (message.type === 'contentScriptReady') {
    console.log('Content script ready in tab', activeTabId);

    // If there's a current command, send it to the newly ready content script
    if (currentCommand) {
      forwardCommandToContentScript(currentCommand);
    } else {
      processCommandQueue();
    }

    sendResponse({ status: 'acknowledged' });
    return true;
  }

  // Forward status updates to the WebSocket
  if (message.type === 'status' || message.type === 'event' || message.type === 'error') {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.log('WebSocket not connected, reconnecting...');
      connectWebSocket();
    }

    sendResponse({ status: 'forwarded' });
    return true;
  }

  return false;
});

// Initialize connection when the service worker starts
connectWebSocket();

console.log('Service worker initialized');
```

### 4. Update Content Script

Update `chrome-extension/src/pages/content/index.tsx`:

```typescript
import { createRoot } from 'react-dom/client';
import React, { useEffect, useState } from 'react';
import { Message, CommandMessage, StatusMessage, EventMessage } from '../../shared/types';

// Content script React component implementation
// This is a simplified version for the implementation plan
function initializeReactComponent() {
  // Create a React component for the sidebar UI
  // This will display status, active command, and logs

  // Set up message listeners for communication with service worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message);

    if (message.type === 'command') {
      // Update UI to show command is executing
      console.log(`Executing command: ${message.payload.action}`);

      // Execute the command
      executeCommand(message)
        .then(result => {
          console.log(`Command executed: ${result.status}`);

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
  });

  // Announce that the content script is ready
  chrome.runtime.sendMessage({ 
    type: 'contentScriptReady',
    timestamp: new Date().toISOString()
  });

  // Set up beforeunload handler for page reloads
  window.addEventListener('beforeunload', () => {
    // Save state to sessionStorage
    sessionStorage.setItem('tribalFarmState', JSON.stringify({
      // Store current state
    }));

    // Notify service worker about the unload
    chrome.runtime.sendMessage({
      type: 'event',
      actionId: 'current-action-id',
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
      // Restore state from saved data
      console.log('Restored state after page reload');
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }
  }
}

// Execute a command on the page
async function executeCommand(command: CommandMessage): Promise<{ status: string, details?: any }> {
  // This is a placeholder - implement actual command execution logic
  console.log(`Executing command: ${command.payload.action}`);

  // Simulate command execution
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.2) { // 80% success rate for testing
        resolve({ status: 'done', details: { result: 'success' } });
      } else {
        reject({ message: 'Command failed', details: { reason: 'random failure' } });
      }
    }, 2000);
  });
}

// DOM Observer to detect modals and popups
function setupDOMObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // Check for modals or popups
        const modals = document.querySelectorAll('.modal, .popup, .dialog');
        if (modals.length > 0) {
          // Send event to service worker
          chrome.runtime.sendMessage({
            type: 'event',
            actionId: 'none', // No specific action
            timestamp: new Date().toISOString(),
            payload: {
              eventType: 'popup',
              details: {
                count: modals.length,
                text: Array.from(modals).map(m => m.textContent).join(' ')
              }
            }
          });
        }
      }
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Function to check if the current domain matches our pattern
function isValidDomain(): boolean {
  const hostname = window.location.hostname;

  // Check if it's a plemiona.pl domain
  if (!hostname.endsWith('.plemiona.pl')) {
    return false;
  }

  // Extract the subdomain (everything before .plemiona.pl)
  const subdomain = hostname.substring(0, hostname.length - '.plemiona.pl'.length);

  // Check if subdomain starts with 'pl' and ends with a number
  return /^pl.*\d$/.test(subdomain);
}

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, checking domain before initializing');
  if (isValidDomain()) {
    console.log('Valid domain detected, initializing content script');
    initializeContentScript();
    setupDOMObserver();
  } else {
    console.log('Domain does not match required pattern, content script will not initialize');
  }
});

// If DOMContentLoaded already fired, initialize immediately if domain is valid
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('DOM already loaded, checking domain before initializing');
  if (isValidDomain()) {
    console.log('Valid domain detected, initializing content script immediately');
    initializeContentScript();
    setupDOMObserver();
  } else {
    console.log('Domain does not match required pattern, content script will not initialize');
  }
}

function initializeContentScript() {
  try {
    console.log('Initializing content script with local Tailwind CSS and Shadow DOM');

    // Create a container and attach a shadow DOM
    const container = document.createElement('div');
    container.id = '__root-extension-container';
    const shadowRoot = container.attachShadow({ mode: 'open' });
    document.body.appendChild(container);

    console.log('Shadow root created and attached to container');

    // Load the local tailwind-content.css file instead of CDN
    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute(
      'href',
      chrome.runtime.getURL('tailwind-content.css')
    );
    shadowRoot.appendChild(linkElement);

    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.left = '0';
    container.style.width = '100vw'; // Fullscreen width
    container.style.height = '100vh';
    container.style.zIndex = '999999'; // Very high z-index to ensure visibility
    container.style.pointerEvents = 'none';

    console.log('Tailwind CSS loaded from local file into shadow root');

    // Create a div inside the shadowRoot to serve as the React root container
    const shadowRootContent = document.createElement('div');
    shadowRootContent.id = '__shadow-content';
    shadowRootContent.className = 'my-extension'; // Add the namespace class for Tailwind styles

    // Set positioning and dimensions
    shadowRootContent.style.position = 'fixed';
    shadowRootContent.style.bottom = '0';
    shadowRootContent.style.left = '0';
    shadowRootContent.style.width = '100vw'; // Fullscreen width
    shadowRootContent.style.height = '100vh';
    shadowRootContent.style.zIndex = '999999'; // Very high z-index to ensure visibility
    shadowRootContent.style.pointerEvents = 'none';

    shadowRoot.appendChild(shadowRootContent);

    console.log('React container created inside shadow root');

    // Mount the React app inside the shadowRoot container
    const root = createRoot(shadowRootContent);
    console.log('React app created');
    // Render the UI component (simplified for this example)
    root.render(/* React component would be rendered here */);

    console.log('React app successfully rendered with Tailwind in Shadow DOM');
  } catch (err) {
    console.error('Error initializing content script:', err);
  }
}
```

### 5. Update Backend WebSocket Implementation

Update `backend/src/main/kotlin/Sockets.kt`:

```kotlin
package com.bngdev.tribalfarm

import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger
import kotlin.time.Duration.Companion.seconds
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*
import java.time.Instant
import java.util.*

@Serializable
sealed class WebSocketMessage {
    abstract val type: String
    abstract val actionId: String
    abstract val timestamp: String
    open val correlationId: String? = null

    @Serializable
    @SerialName("command")
    data class Command(
        override val actionId: String,
        override val timestamp: String,
        override val correlationId: String? = null,
        val payload: CommandPayload
    ) : WebSocketMessage() {
        override val type: String = "command"
    }

    @Serializable
    @SerialName("status")
    data class Status(
        override val actionId: String,
        override val timestamp: String,
        override val correlationId: String? = null,
        val payload: StatusPayload
    ) : WebSocketMessage() {
        override val type: String = "status"
    }

    @Serializable
    @SerialName("event")
    data class Event(
        override val actionId: String,
        override val timestamp: String,
        override val correlationId: String? = null,
        val payload: EventPayload
    ) : WebSocketMessage() {
        override val type: String = "event"
    }

    @Serializable
    @SerialName("error")
    data class Error(
        override val actionId: String,
        override val timestamp: String,
        override val correlationId: String? = null,
        val payload: ErrorPayload
    ) : WebSocketMessage() {
        override val type: String = "error"
    }

    @Serializable
    @SerialName("ack")
    data class Ack(
        override val actionId: String,
        override val timestamp: String,
        override val correlationId: String? = null,
        val payload: AckPayload
    ) : WebSocketMessage() {
        override val type: String = "ack"
    }
}

@Serializable
data class CommandPayload(
    val action: String,
    val parameters: Map<String, JsonElement> = emptyMap()
)

@Serializable
data class StatusPayload(
    val status: String, // "in-progress", "done", "error", "interrupted"
    val details: Map<String, JsonElement>? = null
)

@Serializable
data class EventPayload(
    val eventType: String, // "popup", "modal", "validation", "stateChange"
    val details: Map<String, JsonElement>
)

@Serializable
data class ErrorPayload(
    val message: String,
    val code: String? = null,
    val details: Map<String, JsonElement>? = null
)

@Serializable
data class AckPayload(
    val received: String
)

class Connection(val session: DefaultWebSocketSession) {
    companion object {
        val lastId = AtomicInteger(0)
        val json = Json { 
            ignoreUnknownKeys = true 
            isLenient = true
            serializersModule = SerializersModule {
                polymorphic(WebSocketMessage::class) {
                    subclass(WebSocketMessage.Command::class)
                    subclass(WebSocketMessage.Status::class)
                    subclass(WebSocketMessage.Event::class)
                    subclass(WebSocketMessage.Error::class)
                    subclass(WebSocketMessage.Ack::class)
                }
            }
        }
    }

    val id = lastId.incrementAndGet()
    var lastActivity = System.currentTimeMillis()
    val pendingCommands = ConcurrentHashMap<String, WebSocketMessage.Command>()

    suspend fun send(message: WebSocketMessage) {
        lastActivity = System.currentTimeMillis()
        val jsonString = json.encodeToString(WebSocketMessage.serializer(), message)
        println("[DEBUG_LOG] Sending message: $jsonString")
        session.send(Frame.Text(jsonString))
    }

    suspend fun sendCommand(action: String, parameters: Map<String, JsonElement> = emptyMap()): String {
        val actionId = UUID.randomUUID().toString()
        val command = WebSocketMessage.Command(
            actionId = actionId,
            timestamp = Instant.now().toString(),
            payload = CommandPayload(action, parameters)
        )

        pendingCommands[actionId] = command
        send(command)
        return actionId
    }

    suspend fun acknowledgeMessage(message: WebSocketMessage) {
        val ack = WebSocketMessage.Ack(
            actionId = message.actionId,
            timestamp = Instant.now().toString(),
            correlationId = message.correlationId,
            payload = AckPayload(received = message.actionId)
        )
        send(ack)
    }
}

// Keep track of all connected clients
val connections = ConcurrentHashMap<Int, Connection>()

fun Application.configureSockets() {
    install(WebSockets) {
        pingPeriod = 15.seconds
        timeout = 15.seconds
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }

    routing {
        webSocket("/ws") {
            println("Adding user!")
            val thisConnection = Connection(this)
            connections[thisConnection.id] = thisConnection

            // Send a welcome command
            thisConnection.sendCommand("welcome", mapOf("message" to JsonPrimitive("Welcome to
