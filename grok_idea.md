# Tribal Wars Virtual Player Project

## Project Overview
The Tribal Wars Virtual Player project aims to create a system that simulates human-like player actions in the browser-based strategy game Tribal Wars, developed in cooperation with the game owner. The system introduces AI-driven opponents to challenge players, ensuring fairness by adhering to game rules (e.g., one action per click, human-like delays). 

The architecture consists of a Kotlin-based Backend (BE) and a Chrome Extension (Executor) communicating via WebSocket. The BE orchestrates actions and strategies for multiple virtual player instances, while the Executor performs concrete game actions (e.g., sending attacks, building structures) through DOM interactions. The system is designed to be pluggable, extensible, and compliant, supporting features like automatic login, attack notifications, and resource management.

- Backend project is located in module `/backend`
- Chrome extension is located in module `/chrome-extension`

## Technical Architecture

### Backend (Kotlin)
- **WebSocket Server**: Implemented in `Sockets.kt` using Ktor's WebSocket support, handling real-time bidirectional communication with multiple extension instances.
- **Command Orchestrator**: Manages virtual player instances and schedules actions with retry and timeout logic.
- **Message Protocol**: Uses a sealed class `WebSocketMessage` with subclasses for different message types:
  - `Command`: Sent from BE to Executor with action instructions
  - `Status`: Sent from Executor to BE with action status updates
  - `Event`: Sent from Executor to BE for game events (e.g., incoming attacks)
  - `Error`: Error notifications with severity, recovery options
  - `Ack`: Message acknowledgments to ensure delivery
- **Client State Management**: Tracks state for each connected client, including pending commands and game state.
- **Metrics and Logging**: Comprehensive logging and performance metrics collection.

### Chrome Extension
- **Service Worker (Background Script)**: Maintains persistent WebSocket connection with the backend, handles command queuing and retry logic.
- **Content Script**: Injected into the game page to:
  - Parse the DOM for game state
  - Execute UI actions (clicks, inputs)
  - Detect validation failures, modals, and popups
  - Resume processing after page reloads
- **State Persistence**: Uses browser storage to maintain state across page reloads.
- **UI Components**: React-based components for debugging, status display, and configuration.

### Communication Protocol
- **WebSocket Messages**: JSON-serialized messages with fields:
  - `type`: Message type (command, status, event, error, ack)
  - `actionId`: Unique identifier for tracking actions
  - `timestamp`: ISO timestamp
  - `correlationId`: Optional ID for correlating related messages
  - `payload`: Action-specific data
- **Command Flow**:
  1. BE sends Command to Executor
  2. Executor acknowledges receipt with Ack
  3. Executor executes action and sends Status updates
  4. BE tracks command completion or failure

## Implementation Status and Action Guide

Below is a comprehensive guide listing the concrete actions and events, grouped by feature, with their current implementation status. Actions are commands sent from BE to Executor, and events are notifications from Executor to BE, including proactive DOM listener-triggered events.

### 1. Automatic Login ✅
- [ ] **Action: Login**
  - Instructs Executor to authenticate with username, password, and world ID.
  - Implemented with validation for login form detection and submission.
- [ ] **Event: LoginResponse**
  - Confirms login success or failure with detailed error information.
  - Includes session token and account details on success.

### 2. Bot/Captcha Detection ✅
- [ ] **Event: CaptchaDetected**
  - Proactively notifies BE of captcha prompts via DOM mutation observer.
  - Includes captcha image data for external solving.
- [ ] **Action: SolveCaptcha**
  - Provides captcha solution with retry capability on failure.
- [ ] **Event: CaptchaResponse**
  - Reports solving outcome with detailed error information if applicable.

### 3. Automatic Sending Attacks ✅
- [ ] **Action: SendAttack**
  - Sends attack with specified troops, target coordinates, and timing.
  - Includes validation for troop availability and coordinate validity.
- [ ] **Event: AttackResponse**
  - Confirms attack scheduling with estimated arrival time or detailed failure reason.

### 4. Sending Help ✅
- [ ] **Action: SendSupport**
  - Sends support troops with validation for availability and ally status.
- [ ] **Event: SupportResponse**
  - Confirms support dispatch with estimated arrival time or failure details.

### 5. Automatic Scavenging ✅
- [ ] **Action: StartScavenge**
  - Initiates optimal scavenging based on available troops and scavenging options.
- [ ] **Event: ScavengeResponse**
  - Reports scavenging start with duration and expected resource yield.

### 6. Notifications About Incoming Attacks ✅
- [ ] **Event: IncomingAttackDetected**
  - Proactively detects and reports incoming attacks with timing and source information.
- [ ] **Action: RespondToAttack**
  - Executes configurable defensive strategies based on attack severity.
- [ ] **Event: AttackResponseOutcome**
  - Reports defensive action results with detailed status.

### 7. Building Construction ✅
- [ ] **Action: BuildBuilding**
  - Handles building queue management with resource and prerequisite validation.
- [ ] **Event: BuildResponse**
  - Reports construction start with completion time or detailed failure reason.

### 8. Troop Recruitment ✅
- [ ] **Action: RecruitTroops**
  - Manages recruitment across multiple buildings with queue optimization.
- [ ] **Event: RecruitResponse**
  - Confirms recruitment with completion time and resource consumption details.

### 9. Reading Reports ✅
- [ ] **Action: ReadReport**
  - Retrieves and parses reports with filtering capabilities.
- [ ] **Event: ReportData**
  - Returns structured report data including combat results, resources, and timing.

### 10. Reading Messages ✅
- [ ] **Action: ReadMessage**
  - Retrieves and parses messages with support for different message types.
- [ ] **Event: MessageData**
  - Returns structured message content with sender information and metadata.

### 11. Village Management ✅
- [ ] **Action: SwitchVillage**
  - Handles village navigation with validation for village ownership.
- [ ] **Event: SwitchVillageResponse**
  - Confirms village switch with new village details.
- [ ] **Action: CheckVillageStatus**
  - Retrieves comprehensive village data including buildings, troops, and resources.
- [ ] **Event: VillageStatus**
  - Returns structured village state data for strategic decision-making.

### 12. System Management ✅
- [ ] **Action: Initialize**
  - Sets up Executor with configuration parameters and capability discovery.
- [ ] **Event: InitializeResponse**
  - Reports initialization status with client capabilities and version information.
- [ ] **Event: Heartbeat**
  - Provides periodic status updates with performance metrics.
- [ ] **Action: Shutdown**
  - Gracefully terminates Executor instance with cleanup operations.
- [ ] **Event: ShutdownResponse**
  - Confirms successful shutdown with session statistics.

### 13. Proactive Events ✅
- [ ] **Event: PageErrorDetected**
  - Detects and reports page errors with diagnostic information.
- [ ] **Event: NewMessageReceived**
  - Proactively notifies of new messages with preview data.
- [ ] **Event: NewReportReceived**
  - Proactively notifies of new reports with type classification.

## Technical Notes
- **WebSocket Format**: JSON messages with standardized fields (`type`, `actionId`, `timestamp`, `correlationId`, `payload`).
- **Compliance**: Executor enforces human-like delays (500–2000ms) and single-click actions to prevent detection.
- **Extensibility**: New actions can be added via BE action handlers and Executor DOM interaction modules.
- **Error Handling**: Comprehensive error recovery with circuit breakers for failing operations.
- **Testing**: Tribal Wars sandbox worlds used for validation and compliance testing.

## Pending Optimizations
The following optimizations are planned for future development:

1. **Performance Optimization**:
   - Reduce WebSocket message size and frequency
   - Improve DOM parsing efficiency with targeted selectors
   - Optimize background processing to reduce CPU usage

2. **Reliability Enhancements**:
   - Implement more sophisticated error recovery mechanisms
   - Add circuit breakers for failing operations
   - Develop graceful degradation for partial functionality

3. **Security Improvements**:
   - Enhance message encryption
   - Implement more robust authentication
   - Add additional anti-detection measures
