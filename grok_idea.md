# Tribal Wars Virtual Player Project

## Project Description
The Tribal Wars Virtual Player project aims to create a system that simulates human-like player actions in the browser-based strategy game Tribal Wars, developed in cooperation with the game owner. The system introduces AI-driven opponents to challenge players, ensuring fairness by adhering to game rules (e.g., one action per click, human-like delays). The architecture consists of a Kotlin-based Backend (BE) and a Chrome Extension (Executor) communicating via WebSocket. The BE orchestrates actions and strategies for multiple virtual player instances, while the Executor performs concrete game actions (e.g., sending attacks, building structures) through DOM interactions. The system is designed to be pluggable, extensible, and compliant, supporting features like automatic login, attack notifications, and resource management.
BE project is located in module /backend
Chrome extensions is located in module /chrome-extensions

## Architecture Overview
- **Backend (Kotlin)**:
  - **Command Orchestrator**: Manages virtual player instances and schedules actions.
  - **Strategy Engine**: Pluggable module for decision-making (e.g., attack or build priorities).
  - **Action Handlers**: Modular components for each action (e.g., `SendAttack`, `BuildBuilding`).
  - **WebSocket Server**: Handles real-time communication with Executors.
  - **Data Store**: Persists game state and logs (e.g., PostgreSQL).
  - **Notification System**: Processes Executor events (e.g., incoming attacks).
- **Chrome Extension (Executor)**:
  - **WebSocket Client**: Receives commands and sends events.
  - **Action Executor**: Performs concrete DOM-based actions.
  - **DOM Listeners**: Detects events (e.g., incoming attacks) proactively.
- **Communication**: WebSocket with JSON messages for actions (BE → Executor) and events (Executor → BE).
- **Extensibility**: Pluggable action handlers and strategy plugins for new features.
- **Compliance**: Executor enforces delays and single-click actions to mimic human behavior.

## Step-by-Step Guide of Actions to Implement
Below is a concise guide listing the concrete actions and events to implement, grouped by feature. Each action includes a brief description and a checkmark box for tracking progress. Actions are commands sent from BE to Executor, and events are notifications from Executor to BE, including proactive DOM listener-triggered events.

### 1. Automatic Login
- [ ] **Action: Login**
  - Instructs Executor to authenticate with username, password, and world ID.
- [ ] **Event: LoginResponse**
  - Confirms login success or failure (e.g., invalid credentials).

### 2. Bot/Captcha Detection
- [ ] **Event: CaptchaDetected**
  - Notifies BE of captcha prompts detected via DOM listener.
- [ ] **Action: SolveCaptcha**
  - Provides captcha solution for Executor to submit.
- [ ] **Event: CaptchaResponse**
  - Confirms captcha solving outcome.

### 3. Automatic Sending Attacks
- [ ] **Action: SendAttack**
  - Sends attack to target village with specified troops and coordinates.
- [ ] **Event: AttackResponse**
  - Confirms attack success or failure (e.g., insufficient troops).

### 4. Sending Help
- [ ] **Action: SendSupport**
  - Sends support troops to an allied village.
- [ ] **Event: SupportResponse**
  - Confirms support action outcome.

### 5. Automatic Scavenging
- [ ] **Action: StartScavenge**
  - Initiates scavenging with specified level and troops.
- [ ] **Event: ScavengeResponse**
  - Confirms scavenging action outcome.

### 6. Notifications About Incoming Attacks
- [ ] **Event: IncomingAttackDetected**
  - Proactively notifies BE of incoming attacks via DOM listener.
- [ ] **Action: RespondToAttack**
  - Executes defensive actions (e.g., send support).
- [ ] **Event: AttackResponseOutcome**
  - Confirms defensive action outcome.

### 7. Building Construction
- [ ] **Action: BuildBuilding**
  - Upgrades or constructs a building to a target level.
- [ ] **Event: BuildResponse**
  - Confirms building action outcome.

### 8. Troop Recruitment
- [ ] **Action: RecruitTroops**
  - Recruits specified troops in a building (e.g., barracks).
- [ ] **Event: RecruitResponse**
  - Confirms recruitment outcome.

### 9. Reading Reports
- [ ] **Action: ReadReport**
  - Reads and parses a specific report.
- [ ] **Event: ReportData**
  - Sends parsed report details to BE.

### 10. Reading Messages
- [ ] **Action: ReadMessage**
  - Reads and parses a specific message.
- [ ] **Event: MessageData**
  - Sends parsed message details to BE.

### 11. Village Management
- [ ] **Action: SwitchVillage**
  - Switches to a specified village.
- [ ] **Event: SwitchVillageResponse**
  - Confirms village switch outcome.
- [ ] **Action: CheckVillageStatus**
  - Retrieves village status (e.g., resources, troops).
- [ ] **Event: VillageStatus**
  - Sends village status data to BE.

### 12. System Management
- [ ] **Action: Initialize**
  - Sets up Executor with instance ID and configuration.
- [ ] **Event: InitializeResponse**
  - Confirms Executor initialization.
- [ ] **Event: Heartbeat**
  - Periodically confirms Executor connectivity.
- [ ] **Action: Shutdown**
  - Terminates Executor instance.
- [ ] **Event: ShutdownResponse**
  - Confirms Executor shutdown.

### 13. Proactive Events
- [ ] **Event: PageErrorDetected**
  - Notifies BE of unexpected errors (e.g., session timeout).
- [ ] **Event: NewMessageReceived**
  - Notifies BE of new messages via DOM listener.
- [ ] **Event: NewReportReceived**
  - Notifies BE of new reports via DOM listener.

## Notes
- **WebSocket Format**: Use JSON messages with `type` ("action" or "event"), `instance_id`, `action_id`/`event_id`, `name`, and `params`/`data`.
- **Compliance**: Executor must enforce delays (500–2000ms) and single-click actions.
- **Extensibility**: Add new actions via BE action handlers and Executor updates.
- **Testing**: Fall back to Tribal Wars sandbox worlds to validate compliance.