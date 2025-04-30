Requirements for Backend Architecture Components
Command Orchestrator

Purpose: Manages multiple virtual player instances and schedules their actions to ensure efficient and coordinated gameplay.

Requirements:

Maintain a registry of active virtual player instances, each with a unique instance_id and associated state (e.g., villages, action queue).
Schedule actions for each instance based on priority, game state, and strategy engine inputs.
Support concurrent execution of actions acbased ross instances using asynchronous processing (e.g., Kotlin Coroutines).
Handle instance lifecycle (start, pause, stop) and synchronize with Executor initialization/shutdown.
Queue and throttle actions to prevent overloading Executors or violating game rate limits.
Log all actions and outcomes for auditing and compliance with Tribal Wars rules.
Provide fault tolerance, retrying failed actions or escalating errors to the notification system.
Strategy Engine

Purpose: Pluggable module responsible for decision-making to drive virtual player behavior (e.g., when to attack, which buildings to prioritize).

Requirements:

Implement a plugin-based architecture allowing custom strategy implementations via a Strategy interface.
Support dynamic loading/unloading of strategy plugins at runtime without restarting the BE.
Process game state (e.g., resources, incoming attacks) and Executor events to generate action recommendations.
Allow configuration of strategy parameters (e.g., aggression level, resource thresholds) via external files or database.
Prioritize actions based on game context (e.g., respond to incoming attacks before scavenging).
Ensure strategies are extensible to support new game features or custom behaviors (e.g., tribe coordination).
Log decision-making rationale for debugging and optimization.
Action Handlers

Purpose: Modular components that process and generate specific actions (e.g., SendAttack, BuildBuilding) for Executors.

Requirements:

Implement each action as a separate handler class adhering to a common ActionHandler interface.
Validate action inputs (e.g., troop availability, coordinates) before generating commands.
Generate JSON-formatted WebSocket commands with action_id, instance_id, and action-specific parameters.
Handle Executor responses (success/failure) and update game state in the Data Store.
Support extensibility by allowing new handlers to be added without modifying core BE logic.
Enforce game rule compliance by including metadata (e.g., required delays) in commands for Executor enforcement.
Log all handler activities (e.g., command sent, response received) for traceability.