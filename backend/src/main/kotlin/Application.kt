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
    configureRouting()
}
