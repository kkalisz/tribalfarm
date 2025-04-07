package com.bngdev.tribalfarm.database

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.ktor.server.application.*
import io.ktor.server.config.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction

object DatabaseConfig {
    private lateinit var dataSource: HikariDataSource

    fun init(config: ApplicationConfig) {
        val dbConfig = config.config("database")

        val hikariConfig = HikariConfig().apply {
            driverClassName = dbConfig.property("driverClass").getString()
            jdbcUrl = dbConfig.property("url").getString()
            username = dbConfig.property("user").getString()
            password = dbConfig.property("password").getString()
            maximumPoolSize = dbConfig.property("maxPoolSize").getString().toInt()
            minimumIdle = dbConfig.property("poolSize").getString().toInt()
            connectionTimeout = dbConfig.property("connectionTimeout").getString().toLong()
            idleTimeout = dbConfig.property("idleTimeout").getString().toLong()
            maxLifetime = dbConfig.property("maxLifetime").getString().toLong()
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
        }

        dataSource = HikariDataSource(hikariConfig)
        Database.connect(dataSource)

        // Verify database connection
        transaction {
            exec("SELECT 1")
        }
    }

    fun close() {
        if (::dataSource.isInitialized) {
            dataSource.close()
        }
    }
}
