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
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*
import kotlinx.coroutines.*

/**
 * Structured logger for the application
 */
class Logger(private val context: String) {
    companion object {
        private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS")
        private var isDebugEnabled = true
        private var isMetricsEnabled = true

        // Enable or disable debug logging
        fun setDebugEnabled(enabled: Boolean) {
            isDebugEnabled = enabled
        }

        // Enable or disable metrics logging
        fun setMetricsEnabled(enabled: Boolean) {
            isMetricsEnabled = enabled
        }

        // Create a logger for a specific context
        fun getLogger(context: String): Logger = Logger(context)
    }

    // Log levels
    enum class Level(val label: String) {
        DEBUG("DEBUG"),
        INFO("INFO"),
        WARN("WARN"),
        ERROR("ERROR"),
        METRIC("METRIC")
    }

    // Log a message with context
    private fun log(level: Level, message: String, data: Map<String, Any>? = null) {
        if (level == Level.DEBUG && !isDebugEnabled) return
        if (level == Level.METRIC && !isMetricsEnabled) return

        val timestamp = LocalDateTime.now().format(dateFormatter)
        val dataString = data?.let { 
            data.entries.joinToString(", ") { "${it.key}=${formatValue(it.value)}" } 
        } ?: ""

        val logMessage = "[$timestamp] [${level.label}] [$context] $message ${if (dataString.isNotEmpty()) "{ $dataString }" else ""}"
        println(logMessage)
    }

    // Format a value for logging
    private fun formatValue(value: Any?): String {
        return when (value) {
            null -> "null"
            is String -> "\"$value\""
            is Collection<*> -> "[${value.joinToString(", ") { formatValue(it) }}]"
            is Map<*, *> -> "{${value.entries.joinToString(", ") { "${formatValue(it.key)}=${formatValue(it.value)}" }}}"
            else -> value.toString()
        }
    }

    // Log a debug message
    fun debug(message: String, data: Map<String, Any>? = null) = log(Level.DEBUG, message, data)

    // Log an info message
    fun info(message: String, data: Map<String, Any>? = null) = log(Level.INFO, message, data)

    // Log a warning message
    fun warn(message: String, data: Map<String, Any>? = null) = log(Level.WARN, message, data)

    // Log an error message
    fun error(message: String, data: Map<String, Any>? = null) = log(Level.ERROR, message, data)

    // Log a metric
    fun metric(name: String, value: Any, tags: Map<String, Any>? = null) {
        val data = mutableMapOf<String, Any>("name" to name, "value" to value)
        tags?.let { data.putAll(it) }
        log(Level.METRIC, "Metric: $name", data)
    }

    // Log method entry with parameters
    fun enter(method: String, params: Map<String, Any>? = null) {
        debug("Entering $method", params)
    }

    // Log method exit with result
    fun exit(method: String, result: Any? = null) {
        val data = result?.let { mapOf("result" to it) }
        debug("Exiting $method", data)
    }

    // Log an exception
    fun exception(message: String, exception: Throwable, data: Map<String, Any>? = null) {
        val exceptionData = mutableMapOf<String, Any>(
            "exception" to exception.javaClass.name,
            "message" to (exception.message ?: "No message")
        )
        data?.let { exceptionData.putAll(it) }
        error("$message: ${exception.message}", exceptionData)
    }
}

/**
 * Base interface for all WebSocket messages
 */
@Serializable
sealed class WebSocketMessage {
    abstract val type: String
    abstract val actionId: String
    abstract val timestamp: String
    abstract val correlationId: String?

    /**
     * Command message sent from server to client
     */
    @Serializable
    data class Command(
        override val actionId: String,
        override val timestamp: String,
        override val correlationId: String? = null,
        val payload: CommandPayload
    ) : WebSocketMessage() {
        override val type: String = "command"
    }

    /**
     * Status message sent from client to server
     */
    @Serializable
    data class Status(
        override val actionId: String,
        override val timestamp: String,
        override val correlationId: String? = null,
        val payload: StatusPayload
    ) : WebSocketMessage() {
        override val type: String = "status"
    }

    /**
     * Event message sent from client to server
     */
    @Serializable
    data class Event(
        override val actionId: String,
        override val timestamp: String,
        override val correlationId: String? = null,
        val payload: EventPayload
    ) : WebSocketMessage() {
        override val type: String = "event"
    }

    /**
     * Error message sent in either direction
     */
    @Serializable
    data class Error(
        override val actionId: String,
        override val timestamp: String,
        override val correlationId: String? = null,
        val payload: ErrorPayload
    ) : WebSocketMessage() {
        override val type: String = "error"
    }

    /**
     * Acknowledgment message sent in either direction
     */
    @Serializable
    data class Ack(
        override val actionId: String,
        override val timestamp: String,
        override val correlationId: String? = null,
        val payload: AckPayload
    ) : WebSocketMessage() {
        override val type: String = "ack"
    }
}

/**
 * Payload for Command messages
 */
@Serializable
data class CommandPayload(
    val action: String,
    val parameters: Map<String, JsonElement> = emptyMap()
)

/**
 * Payload for Status messages
 */
@Serializable
data class StatusPayload(
    val status: String, // "in-progress", "done", "error", "interrupted"
    val details: Map<String, JsonElement>? = null
)

/**
 * Payload for Event messages
 */
@Serializable
data class EventPayload(
    val eventType: String, // "popup", "modal", "validation", "stateChange"
    val details: Map<String, JsonElement>
)

/**
 * Payload for Error messages
 */
@Serializable
data class ErrorPayload(
    val message: String,
    val code: String? = null,
    val details: Map<String, JsonElement>? = null,
    val severity: String = "error", // "warning", "error", "critical"
    val recoverable: Boolean = true,
    val retryable: Boolean = false
)

/**
 * Payload for Acknowledgment messages
 */
@Serializable
data class AckPayload(
    val received: String
)

/**
 * Client state for reconnection
 */
@Serializable
data class ClientState(
    val clientId: String,
    val pendingCommands: Map<String, WebSocketMessage.Command>,
    val gameState: Map<String, JsonElement> = emptyMap(),
    val clientCapabilities: Map<String, JsonElement> = emptyMap(),
    val lastActivity: Long = System.currentTimeMillis(),
    val sessionStartTime: Long = System.currentTimeMillis()
)

/**
 * Represents a client connection
 */
class Connection(val session: DefaultWebSocketSession) {
    companion object {
        private val logger = Logger.getLogger("Connection")
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

        // Store client state for reconnection
        private val clientStates = ConcurrentHashMap<String, ClientState>()

        // Get client state by client ID
        fun getClientState(clientId: String): ClientState? = clientStates[clientId]

        // Save client state
        fun saveClientState(clientId: String, state: ClientState) {
            clientStates[clientId] = state
            logger.info("Saved state for client", mapOf(
                "clientId" to clientId,
                "pendingCommands" to state.pendingCommands.size,
                "gameState" to state.gameState.keys
            ))
        }

        // Remove client state
        fun removeClientState(clientId: String) {
            clientStates.remove(clientId)
            logger.info("Removed state for client", mapOf("clientId" to clientId))
        }

        // Get metrics about client states
        fun getClientStateMetrics(): Map<String, Any> {
            return mapOf(
                "totalClients" to clientStates.size,
                "totalPendingCommands" to clientStates.values.sumOf { it.pendingCommands.size },
                "clientIds" to clientStates.keys.toList()
            )
        }
    }

    private val logger = Logger.getLogger("Connection-${lastId.get() + 1}")

    val id = lastId.incrementAndGet()
    var lastActivity = System.currentTimeMillis()
    val pendingCommands = ConcurrentHashMap<String, WebSocketMessage.Command>()

    // Client identification
    var clientId: String? = null
    var clientCapabilities: Map<String, JsonElement> = emptyMap()

    // State tracking
    var gameState: Map<String, JsonElement> = emptyMap()
    var sessionStartTime: Long = System.currentTimeMillis()

    // Performance metrics
    private val metrics = ConcurrentHashMap<String, Long>()
    private val commandDurations = ConcurrentHashMap<String, MutableList<Long>>()

    init {
        logger.info("Connection created", mapOf("id" to id))
    }

    /**
     * Record a metric value
     */
    fun recordMetric(name: String, value: Long) {
        metrics[name] = value
        logger.metric(name, value, mapOf("connectionId" to id, "clientId" to (clientId ?: "unknown")))
    }

    /**
     * Record the duration of a command
     */
    fun recordCommandDuration(command: String, durationMs: Long) {
        val durations = commandDurations.getOrPut(command) { mutableListOf() }
        durations.add(durationMs)

        // Log the metric
        logger.metric("commandDuration", durationMs, mapOf(
            "command" to command,
            "connectionId" to id,
            "clientId" to (clientId ?: "unknown")
        ))
    }

    /**
     * Get metrics for this connection
     */
    fun getMetrics(): Map<String, Any> {
        val result = mutableMapOf<String, Any>()

        // Basic connection metrics
        result["connectionId"] = id
        result["clientId"] = clientId ?: "unknown"
        result["uptime"] = System.currentTimeMillis() - sessionStartTime
        result["lastActivity"] = System.currentTimeMillis() - lastActivity
        result["pendingCommands"] = pendingCommands.size

        // Command metrics
        val cmdMetrics = mutableMapOf<String, Map<String, Any>>()
        commandDurations.forEach { (command, durations) ->
            if (durations.isNotEmpty()) {
                cmdMetrics[command] = mapOf(
                    "count" to durations.size,
                    "totalMs" to durations.sum(),
                    "avgMs" to durations.average(),
                    "minMs" to (durations.minOrNull() ?: 0L),
                    "maxMs" to (durations.maxOrNull() ?: 0L)
                )
            }
        }
        result["commands"] = cmdMetrics

        // Custom metrics
        result.putAll(metrics)

        return result
    }

    /**
     * Save the current state for potential reconnection
     */
    fun saveState() {
        val cid = clientId ?: return // Can't save state without a client ID

        val state = ClientState(
            clientId = cid,
            pendingCommands = pendingCommands.toMap(),
            gameState = gameState,
            clientCapabilities = clientCapabilities,
            lastActivity = lastActivity,
            sessionStartTime = sessionStartTime
        )

        Connection.saveClientState(cid, state)
    }

    /**
     * Restore state from a previous session
     */
    fun restoreState(clientId: String): Boolean {
        val state = Connection.getClientState(clientId) ?: return false

        this.clientId = clientId
        this.clientCapabilities = state.clientCapabilities
        this.gameState = state.gameState
        this.sessionStartTime = state.sessionStartTime
        this.lastActivity = System.currentTimeMillis()

        // Restore pending commands
        pendingCommands.clear()
        pendingCommands.putAll(state.pendingCommands)

        println("[DEBUG_LOG] Restored state for client $clientId: ${pendingCommands.size} pending commands")
        return true
    }

    /**
     * Resume any pending commands after reconnection
     */
    suspend fun resumePendingCommands() {
        if (pendingCommands.isEmpty()) return

        println("[DEBUG_LOG] Resuming ${pendingCommands.size} pending commands for client $clientId")

        // Create a copy to avoid concurrent modification
        val commands = pendingCommands.values.toList()

        // Send each command again
        for (command in commands) {
            // Mark as resumed
            val parameters = command.payload.parameters.toMutableMap()
            parameters["resumed"] = JsonPrimitive(true)
            parameters["resumeTime"] = JsonPrimitive(System.currentTimeMillis())

            val resumedCommand = WebSocketMessage.Command(
                actionId = command.actionId,
                timestamp = Instant.now().toString(),
                correlationId = command.correlationId,
                payload = CommandPayload(command.payload.action, parameters)
            )

            // Replace the command in the pending queue
            pendingCommands[command.actionId] = resumedCommand

            // Send the command
            send(resumedCommand)
            println("[DEBUG_LOG] Resumed command ${resumedCommand.payload.action} (ID: ${resumedCommand.actionId})")

            // Add a small delay between commands to avoid overwhelming the client
            delay(100)
        }
    }

    /**
     * Send a message to this connection
     */
    suspend fun send(message: WebSocketMessage) {
        val startTime = System.currentTimeMillis()
        lastActivity = startTime

        try {
            // Serialize the message
            val jsonString = json.encodeToString(WebSocketMessage.serializer(), message)

            // Log the message
            logger.debug("Sending message", mapOf(
                "type" to message.type,
                "actionId" to message.actionId,
                "messageSize" to jsonString.length
            ))

            // Send the message
            session.send(Frame.Text(jsonString))

            // Record metrics
            val duration = System.currentTimeMillis() - startTime
            recordMetric("lastMessageSendTime", duration)
            recordCommandDuration("send_${message.type}", duration)

            logger.debug("Message sent successfully", mapOf(
                "type" to message.type,
                "actionId" to message.actionId,
                "durationMs" to duration
            ))
        } catch (e: Exception) {
            val duration = System.currentTimeMillis() - startTime
            logger.exception("Failed to send message", e, mapOf(
                "type" to message.type,
                "actionId" to message.actionId,
                "durationMs" to duration
            ))
            throw e
        }
    }

    /**
     * Send a command to this connection
     */
    suspend fun sendCommand(action: String, parameters: Map<String, JsonElement> = emptyMap()): String {
        val startTime = System.currentTimeMillis()
        val actionId = UUID.randomUUID().toString()

        try {
            logger.enter("sendCommand", mapOf(
                "action" to action,
                "parametersCount" to parameters.size,
                "actionId" to actionId
            ))

            // Create the command
            val command = WebSocketMessage.Command(
                actionId = actionId,
                timestamp = Instant.now().toString(),
                payload = CommandPayload(action, parameters)
            )

            // Store in pending commands
            pendingCommands[actionId] = command

            // Send the command
            send(command)

            // Record metrics
            val duration = System.currentTimeMillis() - startTime
            recordMetric("lastCommandSendTime", duration)
            recordCommandDuration("command_$action", duration)

            logger.info("Command sent", mapOf(
                "action" to action,
                "actionId" to actionId,
                "durationMs" to duration
            ))

            return actionId
        } catch (e: Exception) {
            val duration = System.currentTimeMillis() - startTime
            logger.exception("Failed to send command", e, mapOf(
                "action" to action,
                "actionId" to actionId,
                "durationMs" to duration
            ))
            throw e
        } finally {
            logger.exit("sendCommand", actionId)
        }
    }

    /**
     * Send an acknowledgment for a received message
     */
    suspend fun acknowledgeMessage(message: WebSocketMessage) {
        val ack = WebSocketMessage.Ack(
            actionId = message.actionId,
            timestamp = Instant.now().toString(),
            correlationId = message.correlationId,
            payload = AckPayload(received = message.actionId)
        )
        send(ack)
    }

    /**
     * Send an error message
     */
    suspend fun sendError(
        actionId: String, 
        message: String, 
        code: String? = null, 
        details: Map<String, JsonElement>? = null,
        severity: String = "error",
        recoverable: Boolean = true,
        retryable: Boolean = false
    ) {
        val error = WebSocketMessage.Error(
            actionId = actionId,
            timestamp = Instant.now().toString(),
            payload = ErrorPayload(
                message = message, 
                code = code, 
                details = details,
                severity = severity,
                recoverable = recoverable,
                retryable = retryable
            )
        )
        send(error)

        // If the error is retryable, schedule a retry with exponential backoff
        if (retryable && pendingCommands.containsKey(actionId)) {
            val command = pendingCommands[actionId]
            if (command != null) {
                // Get retry count from command details or initialize to 0
                val retryCount = command.payload.parameters["retryCount"]?.jsonPrimitive?.int ?: 0

                // Calculate backoff delay with exponential increase and jitter
                val maxBackoff = 30000L // 30 seconds max
                val baseDelay = 1000L // 1 second base
                val exponentialDelay = minOf(baseDelay * (1L shl retryCount), maxBackoff)
                val jitter = (Math.random() * 0.3 * exponentialDelay).toLong() // 0-30% jitter
                val delay = exponentialDelay + jitter

                println("[DEBUG_LOG] Scheduling retry for command ${command.payload.action} (ID: ${command.actionId}) in ${delay}ms (attempt ${retryCount + 1})")

                // Create a new command with incremented retry count
                val parameters = command.payload.parameters.toMutableMap()
                parameters["retryCount"] = JsonPrimitive(retryCount + 1)
                parameters["isRetry"] = JsonPrimitive(true)

                // Create a new command for retry
                val newCommand = WebSocketMessage.Command(
                    actionId = UUID.randomUUID().toString(), // New ID for the retry
                    timestamp = Instant.now().toString(),
                    correlationId = command.actionId, // Link to original command
                    payload = CommandPayload(command.payload.action, parameters)
                )

                // Schedule the retry using a job
                val job = CoroutineScope(Dispatchers.IO).launch {
                    delay(delay)
                    if (pendingCommands.containsKey(actionId)) {
                        // Command is still pending, retry it

                        // Remove the old command and add the new one
                        pendingCommands.remove(actionId)
                        pendingCommands[newCommand.actionId] = newCommand

                        // Send the new command
                        send(newCommand)
                        println("[DEBUG_LOG] Retrying command ${newCommand.payload.action} (ID: ${newCommand.actionId}, original ID: ${command.actionId})")
                    }
                }

                // Store the job for potential cancellation
                val retryJobs = pendingCommands[actionId]?.payload?.parameters?.get("retryJobs") as? JsonArray ?: JsonArray(emptyList())
                val updatedJobs = JsonArray(retryJobs.toMutableList().apply { add(JsonPrimitive(job.toString())) })
                parameters["retryJobs"] = updatedJobs
            }
        }
    }

    /**
     * Schedule a command to be executed after a delay
     */
    fun scheduleCommand(command: WebSocketMessage.Command, delayMs: Long) {
        CoroutineScope(Dispatchers.IO).launch {
            delay(delayMs)
            if (!pendingCommands.containsKey(command.actionId)) {
                pendingCommands[command.actionId] = command
                send(command)
                println("[DEBUG_LOG] Scheduled command ${command.payload.action} (ID: ${command.actionId}) executed after ${delayMs}ms delay")
            }
        }
    }

    /**
     * Broadcast a message to all connections
     */
    suspend fun broadcast(message: WebSocketMessage) {
        connections.values.forEach { it.send(message) }
    }
}

// Keep track of all connected clients
val connections = ConcurrentHashMap<Int, Connection>()

/**
 * Configure WebSocket endpoints
 */
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

            try {
                // Send a welcome message and request client identification
                val welcomeParams = mapOf(
                    "message" to JsonPrimitive("Welcome to Tribal Farm!"),
                    "serverTime" to JsonPrimitive(System.currentTimeMillis()),
                    "requestClientId" to JsonPrimitive(true)
                )
                thisConnection.sendCommand("welcome", welcomeParams)

                for (frame in incoming) {
                    if (frame is Frame.Text) {
                        try {
                            val text = frame.readText()
                            println("[DEBUG_LOG] Received raw message: $text")

                            try {
                                val message = Connection.json.decodeFromString(WebSocketMessage.serializer(), text)
                                println("[DEBUG_LOG] Successfully decoded message: $message")

                                // Acknowledge receipt of the message
                                thisConnection.acknowledgeMessage(message)

                                // Process the message based on its type
                                when (message) {
                                    is WebSocketMessage.Command -> {
                                        // Handle command from client (unusual but supported)
                                        println("[DEBUG_LOG] Received command from client: ${message.payload.action}")

                                        when (message.payload.action.lowercase()) {
                                            "quit", "exit", "bye" -> {
                                                close(CloseReason(CloseReason.Codes.NORMAL, "Client requested disconnect"))
                                            }
                                            else -> {
                                                // Echo back the command as an error for now
                                                thisConnection.sendError(
                                                    actionId = message.actionId,
                                                    message = "Unknown command: ${message.payload.action}",
                                                    code = "UNKNOWN_COMMAND"
                                                )
                                            }
                                        }
                                    }

                                    is WebSocketMessage.Status -> {
                                        // Handle status update from client
                                        println("[DEBUG_LOG] Received status update: ${message.payload.status} for action ${message.actionId}")

                                        // Update the status of the command if it exists
                                        val command = thisConnection.pendingCommands[message.actionId]
                                        if (command != null) {
                                            println("[DEBUG_LOG] Found matching command: ${command.payload.action}")

                                            // If the command is complete, remove it from pending
                                            if (message.payload.status == "done" || message.payload.status == "error") {
                                                thisConnection.pendingCommands.remove(message.actionId)
                                                println("[DEBUG_LOG] Removed completed command from pending queue")
                                            }
                                        } else {
                                            println("[DEBUG_LOG] No matching command found for status update")
                                        }
                                    }

                                    is WebSocketMessage.Event -> {
                                        // Handle event from client
                                        println("[DEBUG_LOG] Received event: ${message.payload.eventType}")

                                        // Process different event types
                                        when (message.payload.eventType) {
                                            "popup", "modal" -> {
                                                println("[DEBUG_LOG] Client reported popup/modal: ${message.payload.details}")
                                            }
                                            "stateChange" -> {
                                                println("[DEBUG_LOG] Client reported state change: ${message.payload.details}")

                                                // Check if this is a page unload event
                                                if (message.payload.details["type"]?.jsonPrimitive?.content == "pageUnload") {
                                                    // Save state for potential reconnection
                                                    thisConnection.saveState()
                                                    println("[DEBUG_LOG] Saved state for client ${thisConnection.clientId} due to page unload")
                                                }
                                            }
                                            "clientIdentification" -> {
                                                // Client is identifying itself
                                                val clientId = message.payload.details["clientId"]?.jsonPrimitive?.content
                                                val capabilities = message.payload.details["capabilities"] as? JsonObject

                                                if (clientId != null) {
                                                    println("[DEBUG_LOG] Client identified as: $clientId")

                                                    // Store client ID
                                                    thisConnection.clientId = clientId

                                                    // Store capabilities if provided
                                                    if (capabilities != null) {
                                                        thisConnection.clientCapabilities = capabilities.toMap()
                                                        println("[DEBUG_LOG] Client capabilities: ${capabilities.toMap()}")
                                                    }

                                                    // Check if we have saved state for this client
                                                    if (thisConnection.restoreState(clientId)) {
                                                        // State restored, resume pending commands
                                                        thisConnection.resumePendingCommands()

                                                        // Send state restored confirmation
                                                        val stateRestoredParams = mapOf(
                                                            "stateRestored" to JsonPrimitive(true),
                                                            "pendingCommands" to JsonPrimitive(thisConnection.pendingCommands.size),
                                                            "sessionStartTime" to JsonPrimitive(thisConnection.sessionStartTime)
                                                        )
                                                        thisConnection.sendCommand("stateRestored", stateRestoredParams)
                                                    } else {
                                                        // No saved state, this is a new session
                                                        println("[DEBUG_LOG] No saved state found for client $clientId")

                                                        // Send new session confirmation
                                                        val newSessionParams = mapOf(
                                                            "newSession" to JsonPrimitive(true),
                                                            "sessionStartTime" to JsonPrimitive(thisConnection.sessionStartTime)
                                                        )
                                                        thisConnection.sendCommand("sessionStarted", newSessionParams)
                                                    }
                                                }
                                            }
                                            else -> {
                                                println("[DEBUG_LOG] Unhandled event type: ${message.payload.eventType}")
                                            }
                                        }
                                    }

                                    is WebSocketMessage.Error -> {
                                        // Handle error from client
                                        println("[DEBUG_LOG] Received error: ${message.payload.message}")

                                        // Log the error but don't take action for now
                                        if (message.payload.code != null) {
                                            println("[DEBUG_LOG] Error code: ${message.payload.code}")
                                        }
                                    }

                                    is WebSocketMessage.Ack -> {
                                        // Handle acknowledgment from client
                                        println("[DEBUG_LOG] Received acknowledgment for message: ${message.payload.received}")
                                    }

                                    else -> {
                                        // This branch handles any future subclasses of WebSocketMessage
                                        println("[DEBUG_LOG] Received unknown message type: ${message::class.simpleName}")
                                        thisConnection.sendError(
                                            actionId = message.actionId,
                                            message = "Unsupported message type: ${message::class.simpleName}",
                                            code = "UNSUPPORTED_TYPE"
                                        )
                                    }
                                }
                            } catch (e: Exception) {
                                println("[DEBUG_LOG] Failed to decode message: ${e.message}")

                                // Send an error response for invalid messages
                                thisConnection.sendError(
                                    actionId = UUID.randomUUID().toString(),
                                    message = "Invalid message format: ${e.message}",
                                    code = "INVALID_FORMAT"
                                )
                            }
                        } catch (e: Exception) {
                            println("[DEBUG_LOG] Error processing frame: ${e.message}")
                        }
                    }
                }
            } catch (e: Exception) {
                println("[DEBUG_LOG] Error in WebSocket session: ${e.message}")
            } finally {
                println("Removing user!")

                // Save state if client has an ID
                if (thisConnection.clientId != null) {
                    thisConnection.saveState()
                    println("[DEBUG_LOG] Saved state for client ${thisConnection.clientId} on disconnect")
                }

                connections.remove(thisConnection.id)
            }
        }
    }
}
