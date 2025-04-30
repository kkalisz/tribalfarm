package com.bngdev.tribalfarm

import io.ktor.websocket.*
import kotlinx.coroutines.*
import kotlinx.serialization.json.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger
import java.time.Instant
import java.util.*
import io.ktor.server.application.*

/**
 * Command Orchestrator
 *
 * Purpose: Manages multiple virtual player instances and schedules their actions to ensure efficient and coordinated gameplay.
 *
 * Responsibilities:
 * - Maintain a registry of active virtual player instances
 * - Schedule actions for each instance based on priority, game state, and strategy engine inputs
 * - Support concurrent execution of actions across instances using asynchronous processing
 * - Handle instance lifecycle (start, pause, stop)
 * - Queue and throttle actions to prevent overloading Executors or violating game rate limits
 * - Log all actions and outcomes for auditing and compliance
 * - Provide fault tolerance, retrying failed actions or escalating errors
 */
class CommandOrchestrator {
    companion object {
        private val logger = Logger.getLogger("CommandOrchestrator")
        private val instance = CommandOrchestrator()
        
        fun getInstance(): CommandOrchestrator = instance
    }
    
    // Registry of active virtual player instances
    private val instances = ConcurrentHashMap<String, VirtualPlayerInstance>()
    
    // Action queue for each instance
    private val actionQueues = ConcurrentHashMap<String, PriorityQueue<ScheduledAction>>()
    
    // Coroutine scope for async processing
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    // Rate limiting configuration
    private val rateLimits = ConcurrentHashMap<String, RateLimit>()
    
    // Metrics
    private val metrics = ConcurrentHashMap<String, AtomicInteger>()
    
    /**
     * Initialize the Command Orchestrator
     */
    init {
        logger.info("Initializing Command Orchestrator")
        
        // Start the scheduler
        startScheduler()
        
        // Initialize metrics
        metrics["totalActionsScheduled"] = AtomicInteger(0)
        metrics["totalActionsExecuted"] = AtomicInteger(0)
        metrics["totalActionsFailed"] = AtomicInteger(0)
        metrics["totalActionsRetried"] = AtomicInteger(0)
    }
    
    /**
     * Start the action scheduler
     */
    private fun startScheduler() {
        scope.launch {
            logger.info("Starting action scheduler")
            
            while (isActive) {
                try {
                    // Process action queues for each instance
                    instances.keys.forEach { instanceId ->
                        processActionQueue(instanceId)
                    }
                    
                    // Small delay to prevent CPU overuse
                    delay(100)
                } catch (e: Exception) {
                    logger.exception("Error in action scheduler", e)
                }
            }
        }
    }
    
    /**
     * Process the action queue for a specific instance
     */
    private suspend fun processActionQueue(instanceId: String) {
        val queue = actionQueues.getOrPut(instanceId) { PriorityQueue<ScheduledAction>() }
        val instance = instances[instanceId] ?: return
        
        // Check if the instance is active
        if (!instance.isActive) {
            return
        }
        
        // Check if there are actions to process
        if (queue.isEmpty()) {
            return
        }
        
        // Get the next action
        val action = queue.peek()
        
        // Check if it's time to execute the action
        if (action.scheduledTime <= System.currentTimeMillis()) {
            // Remove the action from the queue
            queue.poll()
            
            // Check rate limits
            val actionType = action.action.payload.action
            val rateLimit = rateLimits[actionType]
            
            if (rateLimit != null && !rateLimit.canExecute()) {
                // Re-schedule the action with a delay
                val delay = rateLimit.getNextAllowedTime() - System.currentTimeMillis()
                scheduleAction(instanceId, action.action, delay)
                logger.info("Rate limited action rescheduled", mapOf(
                    "instanceId" to instanceId,
                    "actionId" to action.action.actionId,
                    "actionType" to actionType,
                    "delay" to delay
                ))
                return
            }
            
            // Execute the action
            executeAction(instanceId, action)
        }
    }
    
    /**
     * Execute an action for a specific instance
     */
    private suspend fun executeAction(instanceId: String, scheduledAction: ScheduledAction) {
        val instance = instances[instanceId] ?: return
        val connection = connections[instance.connectionId] ?: return
        val action = scheduledAction.action
        
        logger.info("Executing action", mapOf(
            "instanceId" to instanceId,
            "actionId" to action.actionId,
            "actionType" to action.payload.action
        ))
        
        try {
            // Send the command to the client
            connection.send(action)
            
            // Update metrics
            metrics["totalActionsExecuted"]?.incrementAndGet()
            
            // Update rate limit
            val actionType = action.payload.action
            rateLimits[actionType]?.recordExecution()
            
        } catch (e: Exception) {
            logger.exception("Failed to execute action", e, mapOf(
                "instanceId" to instanceId,
                "actionId" to action.actionId,
                "actionType" to action.payload.action
            ))
            
            // Update metrics
            metrics["totalActionsFailed"]?.incrementAndGet()
            
            // Retry the action if it's retryable
            if (scheduledAction.retryCount < scheduledAction.maxRetries) {
                retryAction(instanceId, scheduledAction)
            }
        }
    }
    
    /**
     * Retry a failed action
     */
    private fun retryAction(instanceId: String, scheduledAction: ScheduledAction) {
        val retryDelay = calculateRetryDelay(scheduledAction.retryCount)
        val newScheduledAction = scheduledAction.copy(
            scheduledTime = System.currentTimeMillis() + retryDelay,
            retryCount = scheduledAction.retryCount + 1
        )
        
        // Add the action back to the queue
        actionQueues.getOrPut(instanceId) { PriorityQueue<ScheduledAction>() }.add(newScheduledAction)
        
        // Update metrics
        metrics["totalActionsRetried"]?.incrementAndGet()
        
        logger.info("Action scheduled for retry", mapOf(
            "instanceId" to instanceId,
            "actionId" to scheduledAction.action.actionId,
            "actionType" to scheduledAction.action.payload.action,
            "retryCount" to newScheduledAction.retryCount,
            "retryDelay" to retryDelay
        ))
    }
    
    /**
     * Calculate retry delay with exponential backoff
     */
    private fun calculateRetryDelay(retryCount: Int): Long {
        val baseDelay = 1000L // 1 second
        val maxDelay = 30000L // 30 seconds
        val exponentialDelay = minOf(baseDelay * (1L shl retryCount), maxDelay)
        val jitter = (Math.random() * 0.3 * exponentialDelay).toLong() // 0-30% jitter
        return exponentialDelay + jitter
    }
    
    /**
     * Register a new virtual player instance
     */
    fun registerInstance(instanceId: String, connectionId: Int): VirtualPlayerInstance {
        logger.info("Registering new instance", mapOf(
            "instanceId" to instanceId,
            "connectionId" to connectionId
        ))
        
        val instance = VirtualPlayerInstance(
            id = instanceId,
            connectionId = connectionId,
            isActive = true,
            createdAt = System.currentTimeMillis()
        )
        
        instances[instanceId] = instance
        actionQueues[instanceId] = PriorityQueue<ScheduledAction>()
        
        return instance
    }
    
    /**
     * Unregister a virtual player instance
     */
    fun unregisterInstance(instanceId: String) {
        logger.info("Unregistering instance", mapOf("instanceId" to instanceId))
        
        instances.remove(instanceId)
        actionQueues.remove(instanceId)
    }
    
    /**
     * Get a virtual player instance by ID
     */
    fun getInstance(instanceId: String): VirtualPlayerInstance? = instances[instanceId]
    
    /**
     * Schedule an action for a specific instance
     */
    fun scheduleAction(
        instanceId: String,
        action: WebSocketMessage.Command,
        delayMs: Long = 0,
        priority: Int = 0,
        maxRetries: Int = 3
    ): Boolean {
        val instance = instances[instanceId] ?: return false
        
        // Create a scheduled action
        val scheduledAction = ScheduledAction(
            action = action,
            scheduledTime = System.currentTimeMillis() + delayMs,
            priority = priority,
            retryCount = 0,
            maxRetries = maxRetries
        )
        
        // Add the action to the queue
        actionQueues.getOrPut(instanceId) { PriorityQueue<ScheduledAction>() }.add(scheduledAction)
        
        // Update metrics
        metrics["totalActionsScheduled"]?.incrementAndGet()
        
        logger.info("Action scheduled", mapOf(
            "instanceId" to instanceId,
            "actionId" to action.actionId,
            "actionType" to action.payload.action,
            "delayMs" to delayMs,
            "priority" to priority
        ))
        
        return true
    }
    
    /**
     * Set the active state of an instance
     */
    fun setInstanceActive(instanceId: String, active: Boolean): Boolean {
        val instance = instances[instanceId] ?: return false
        
        instance.isActive = active
        
        logger.info("Instance active state changed", mapOf(
            "instanceId" to instanceId,
            "active" to active
        ))
        
        return true
    }
    
    /**
     * Configure rate limiting for an action type
     */
    fun configureRateLimit(actionType: String, maxRequests: Int, periodMs: Long) {
        rateLimits[actionType] = RateLimit(maxRequests, periodMs)
        
        logger.info("Rate limit configured", mapOf(
            "actionType" to actionType,
            "maxRequests" to maxRequests,
            "periodMs" to periodMs
        ))
    }
    
    /**
     * Get metrics for the Command Orchestrator
     */
    fun getMetrics(): Map<String, Any> {
        val result = mutableMapOf<String, Any>()
        
        // Basic metrics
        metrics.forEach { (key, value) ->
            result[key] = value.get()
        }
        
        // Instance metrics
        result["activeInstances"] = instances.count { it.value.isActive }
        result["totalInstances"] = instances.size
        
        // Queue metrics
        result["totalQueuedActions"] = actionQueues.values.sumOf { it.size }
        
        return result
    }
    
    /**
     * Shutdown the Command Orchestrator
     */
    fun shutdown() {
        logger.info("Shutting down Command Orchestrator")
        
        // Cancel all coroutines
        scope.cancel()
        
        // Clear all data
        instances.clear()
        actionQueues.clear()
        rateLimits.clear()
    }
}

/**
 * Represents a virtual player instance
 */
data class VirtualPlayerInstance(
    val id: String,
    val connectionId: Int,
    var isActive: Boolean,
    val createdAt: Long,
    val gameState: MutableMap<String, JsonElement> = mutableMapOf()
)

/**
 * Represents a scheduled action
 */
data class ScheduledAction(
    val action: WebSocketMessage.Command,
    val scheduledTime: Long,
    val priority: Int,
    val retryCount: Int,
    val maxRetries: Int
) : Comparable<ScheduledAction> {
    override fun compareTo(other: ScheduledAction): Int {
        // First compare by scheduled time
        val timeComparison = scheduledTime.compareTo(other.scheduledTime)
        if (timeComparison != 0) {
            return timeComparison
        }
        
        // Then compare by priority (higher priority first)
        return other.priority.compareTo(priority)
    }
}

/**
 * Rate limiting for actions
 */
class RateLimit(
    private val maxRequests: Int,
    private val periodMs: Long
) {
    private val executionTimes = LinkedList<Long>()
    
    /**
     * Check if an action can be executed
     */
    @Synchronized
    fun canExecute(): Boolean {
        val now = System.currentTimeMillis()
        
        // Remove old execution times
        while (executionTimes.isNotEmpty() && executionTimes.first() < now - periodMs) {
            executionTimes.removeFirst()
        }
        
        // Check if we're under the limit
        return executionTimes.size < maxRequests
    }
    
    /**
     * Record an execution
     */
    @Synchronized
    fun recordExecution() {
        executionTimes.add(System.currentTimeMillis())
    }
    
    /**
     * Get the next allowed execution time
     */
    @Synchronized
    fun getNextAllowedTime(): Long {
        if (canExecute()) {
            return System.currentTimeMillis()
        }
        
        // Calculate when the oldest execution will expire
        return executionTimes.first() + periodMs
    }
}

/**
 * Configure the Command Orchestrator
 */
fun Application.configureCommandOrchestrator() {
    // Get the Command Orchestrator instance
    val orchestrator = CommandOrchestrator.getInstance()
    
    // Configure default rate limits
    orchestrator.configureRateLimit("sendAttack", 5, 60000) // 5 attacks per minute
}