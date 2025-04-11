
# Browser Extension Automation Architecture

## ✅ Project Overview

We are building a **browser extension** to automate interactions with a browser-based game (similar to TribalWars). The extension communicates with a **backend server via WebSocket**. The game reloads the page after each action, so the extension must be resilient to full page reloads and loss of in-memory state.

---

## 🧱 High-Level Architecture

### 1. Browser Extension

#### a. Content Script
- Injected into the game page.
- Responsible for:
  - Parsing the DOM.
  - Executing UI actions (clicks, inputs).
  - Detecting validation failures, modals, and popups.
  - Sending updates to the service worker.
  - Resuming processing after reloads.

#### b. Service Worker (Persistent Background Script)
- Maintains a persistent WebSocket connection with the backend.
- Routes messages to/from the content script.
- Tracks the current command and its status.
- Handles command queuing and retry/resume logic.
- Listens for reconnection from the content script after reloads.

#### c. Extension UI (Optional)
- Can be a popup or sidebar for debugging, status display, or manual overrides.

### 2. Backend Server

- WebSocket server managing multiple client (extension) sessions.
- Sends action commands (e.g., `attack`, `sendResources`) with unique `actionId`.
- Receives status updates (`in-progress`, `done`, `error`, `popup`, `validationFailed`).
- Maintains action queue and can react to partial completion or retries.

---

## 🔁 Handling Page Reloads

### Strategy:
Use the service worker to persist command state and re-synchronize with the content script after reload.

### Implementation:
- Before navigation (via `window.beforeunload`), the content script notifies the service worker.
- On content script re-injection (after reload):
  - It announces itself to the service worker.
  - Requests current active command.
  - Validates page state and resumes/adjusts execution.

---

## 📡 Communication Protocol

- All messages use structured JSON:
```json
{
  "type": "command" | "status" | "event" | "error",
  "actionId": "string",
  "payload": { ... },
  "timestamp": "ISO-8601",
  "correlationId": "optional"
}
```

- Common types:
  - `command`: Sent from backend to execute an action.
  - `status`: Sent from plugin (e.g., `done`, `error`, `interrupted`).
  - `event`: For detected popups, modals, state changes.
  - `ack`: To confirm message receipt and progress.

---

## ⚙️ Implementation Steps

### 🧩 Extension

#### Manifest
- Use `manifest_version: 3`.
- Permissions: `scripting`, `tabs`, `activeTab`, `<game-domain>`, `storage`, `webRequest`.

#### Content Script
- [ ] Injected into the game domain.
- [ ] Parses DOM, performs UI actions.
- [ ] Sends periodic DOM state to service worker.
- [ ] Detects modals/popups/errors/validation blocks.
- [ ] Listens for messages from service worker (via `chrome.runtime.onMessage`).
- [ ] Implements `onBeforeUnload` to inform service worker.
- [ ] Stores transient state in `sessionStorage`.

#### Service Worker
- [ ] Maintains WebSocket connection to backend.
- [ ] Forwards commands to content script.
- [ ] Tracks current action + `actionId`.
- [ ] Buffers commands if content script not available.
- [ ] On content script reload:
  - Sends resume command with action context.
  - Waits for confirmation of progress or error.

### 🛠 Backend

- [ ] WebSocket server managing clients (browser instances).
- [ ] Sends JSON commands to browser clients.
- [ ] Waits for responses: `ack`, `done`, `error`.
- [ ] Requeues command if interrupted (e.g., timeout).
- [ ] Can detect state stalling (e.g., due to modal).
- [ ] Logs all state transitions.

---

## 🛡 Error Handling

### Connection loss
- Reconnect WebSocket in service worker with exponential backoff.
- Resume or retry last command upon reconnect.

### Page reload
- Use `sessionStorage` or service worker state to resume execution.

### Validation failed
- Send status update with reason and current DOM snapshot (if needed).

### Unexpected popup
- Detect modal via DOM observer, send to backend for handling.
- Backend can optionally pause queue or send override command.

---

## 🧪 Testing & Debugging

- Include debug mode (on extension popup or UI) to:
  - View current command.
  - Manually trigger DOM snapshots.
  - Override or cancel active actions.
