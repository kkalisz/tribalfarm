package com.bngdev.tribalfarm.plugins

import com.bngdev.tribalfarm.database.DatabaseConfig
import io.ktor.server.application.*

fun Application.configureDatabase() {
    DatabaseConfig.init(environment.config)
}