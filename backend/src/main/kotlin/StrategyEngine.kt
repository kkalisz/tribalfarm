package com.bngdev.tribalfarm

import kotlinx.serialization.json.*
import java.util.concurrent.ConcurrentHashMap
import io.ktor.server.application.*
import java.util.*

/**
 * Strategy Engine
 *
 * Purpose: Pluggable module responsible for decision-making to drive virtual player behavior.
 */
class StrategyEngine {
    companion object {
        private val logger = Logger.getLogger("StrategyEngine")
        private val instance = StrategyEngine()
        
        fun getInstance(): StrategyEngine = instance
    }
    
    // Registry of available strategies
    private val strategies = ConcurrentHashMap<String, Strategy>()
    
    // Active strategies for each instance
    private val instanceStrategies = ConcurrentHashMap<String, MutableList<String>>()
    
    // Strategy configurations
    private val strategyConfigs = ConcurrentHashMap<String, JsonObject>()
    
    /**
     * Initialize the Strategy Engine
     */
    init {
        logger.info("Initializing Strategy Engine")
        
        // Register built-in strategies
        registerBuiltInStrategies()
    }
    
    /**
     * Register built-in strategies
     */
    private fun registerBuiltInStrategies() {
        // Register default strategies
        registerStrategy(ResourceOptimizationStrategy())
        registerStrategy(DefensiveStrategy())
        registerStrategy(ExpansionStrategy())
        
        logger.info("Registered built-in strategies", mapOf(
            "count" to strategies.size,
            "strategies" to strategies.keys
        ))
    }
    
    /**
     * Register a strategy
     */
    fun registerStrategy(strategy: Strategy) {
        strategies[strategy.id] = strategy
        
        logger.info("Strategy registered", mapOf(
            "id" to strategy.id,
            "name" to strategy.name,
            "description" to strategy.description
        ))
    }
    
    /**
     * Process game state and generate action recommendations
     */
    fun processGameState(
        instanceId: String,
        gameState: Map<String, JsonElement>
    ): List<ActionRecommendation> {
        val activeStrategies = getActiveStrategies(instanceId)
        if (activeStrategies.isEmpty()) {
            logger.warn("No active strategies for instance", mapOf("instanceId" to instanceId))
            return emptyList()
        }
        
        // Collect recommendations from all active strategies
        val recommendations = mutableListOf<ActionRecommendation>()
        
        activeStrategies.forEach { strategy ->
            try {
                // Get configuration for this strategy and instance
                val config = strategyConfigs["$instanceId:${strategy.id}"]
                
                // Generate recommendations
                val strategyRecommendations = strategy.generateRecommendations(instanceId, gameState, config)
                
                // Add to the list
                recommendations.addAll(strategyRecommendations)
            } catch (e: Exception) {
                logger.exception("Error generating recommendations from strategy", e, mapOf(
                    "strategyId" to strategy.id,
                    "instanceId" to instanceId
                ))
            }
        }
        
        // Sort by priority (higher first)
        return recommendations.sortedByDescending { it.priority }
    }
    
    /**
     * Get active strategies for an instance
     */
    fun getActiveStrategies(instanceId: String): List<Strategy> {
        val activeStrategyIds = instanceStrategies[instanceId] ?: return emptyList()
        return activeStrategyIds.mapNotNull { strategies[it] }
    }
    
    /**
     * Create a command from an action recommendation
     */
    fun createCommand(recommendation: ActionRecommendation): WebSocketMessage.Command {
        return WebSocketMessage.Command(
            actionId = UUID.randomUUID().toString(),
            timestamp = java.time.Instant.now().toString(),
            payload = CommandPayload(
                action = recommendation.actionType,
                parameters = recommendation.parameters
            )
        )
    }
}

/**
 * Strategy interface
 */
interface Strategy {
    /**
     * Unique identifier for the strategy
     */
    val id: String
    
    /**
     * Human-readable name of the strategy
     */
    val name: String
    
    /**
     * Description of what the strategy does
     */
    val description: String
    
    /**
     * Generate action recommendations based on game state
     */
    fun generateRecommendations(
        instanceId: String,
        gameState: Map<String, JsonElement>,
        config: JsonObject? = null
    ): List<ActionRecommendation>
    
    /**
     * Process an event and generate action recommendations
     */
    fun processEvent(
        instanceId: String,
        event: WebSocketMessage.Event,
        gameState: Map<String, JsonElement>,
        config: JsonObject? = null
    ): List<ActionRecommendation>
}

/**
 * Action recommendation from a strategy
 */
data class ActionRecommendation(
    val actionType: String,
    val parameters: Map<String, JsonElement>,
    val priority: Int,
    val reason: String,
    val strategyId: String
)

/**
 * Resource Optimization Strategy
 */
class ResourceOptimizationStrategy : Strategy {
    override val id: String = "resource-optimization"
    override val name: String = "Resource Optimization"
    override val description: String = "Optimizes resource production and usage"
    
    override fun generateRecommendations(
        instanceId: String,
        gameState: Map<String, JsonElement>,
        config: JsonObject?
    ): List<ActionRecommendation> {
        return emptyList()
    }
    
    override fun processEvent(
        instanceId: String,
        event: WebSocketMessage.Event,
        gameState: Map<String, JsonElement>,
        config: JsonObject?
    ): List<ActionRecommendation> {
        return emptyList()
    }
}

/**
 * Defensive Strategy
 */
class DefensiveStrategy : Strategy {
    override val id: String = "defensive"
    override val name: String = "Defensive Strategy"
    override val description: String = "Defends villages from attacks"
    
    override fun generateRecommendations(
        instanceId: String,
        gameState: Map<String, JsonElement>,
        config: JsonObject?
    ): List<ActionRecommendation> {
        return emptyList()
    }
    
    override fun processEvent(
        instanceId: String,
        event: WebSocketMessage.Event,
        gameState: Map<String, JsonElement>,
        config: JsonObject?
    ): List<ActionRecommendation> {
        return emptyList()
    }
}

/**
 * Expansion Strategy
 */
class ExpansionStrategy : Strategy {
    override val id: String = "expansion"
    override val name: String = "Expansion Strategy"
    override val description: String = "Expands territory and conquers new villages"
    
    override fun generateRecommendations(
        instanceId: String,
        gameState: Map<String, JsonElement>,
        config: JsonObject?
    ): List<ActionRecommendation> {
        return emptyList()
    }
    
    override fun processEvent(
        instanceId: String,
        event: WebSocketMessage.Event,
        gameState: Map<String, JsonElement>,
        config: JsonObject?
    ): List<ActionRecommendation> {
        return emptyList()
    }
}