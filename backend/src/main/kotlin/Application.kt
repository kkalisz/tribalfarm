package com.bngdev.tribalfarm

import com.bngdev.tribalfarm.plugins.*
import io.ktor.server.application.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureDatabase()
    configureSecurity()
    configureSerialization()
    configureHTTP()
    configureMonitoring()
    configureSockets()
    configureCommandOrchestrator()
    configureStrategyEngine()
    configureActionHandlers()
    configureRouting()
}

/**
 * Configure the Strategy Engine
 */
fun Application.configureStrategyEngine() {
    // Initialize the Strategy Engine
    val strategyEngine = StrategyEngine.getInstance()

    // Log initialization
    log.info("Strategy Engine initialized")
}

/**
 * Configure the Action Handlers
 */
fun Application.configureActionHandlers() {
    // Initialize the Action Handler Registry
    val actionHandlerRegistry = ActionHandlerRegistry.getInstance()

    // Log initialization
    log.info("Action Handlers initialized")
}
