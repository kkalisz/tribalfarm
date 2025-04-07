package com.bngdev.tribalfarm.database

import io.ktor.server.config.*
import io.ktor.server.testing.*
import kotlin.test.Test
import kotlin.test.assertEquals
import org.jetbrains.exposed.sql.transactions.transaction

class DatabaseConfigTest {
    @Test
    fun testDatabaseConnection() = testApplication {
        val config = MapApplicationConfig().apply {
            put("database.driverClass", "org.h2.Driver")
            put("database.url", "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1")
            put("database.user", "sa")
            put("database.password", "")
            put("database.poolSize", "1")
            put("database.maxPoolSize", "5")
            put("database.connectionTimeout", "30000")
            put("database.idleTimeout", "600000")
            put("database.maxLifetime", "1800000")
        }

        application {
            // Initialize database
            DatabaseConfig.init(config)

            // Test connection by executing a simple query
            val result = transaction {
                exec("SELECT 1 as test") { rs ->
                    rs.next()
                    rs.getInt("test")
                }
            }

            assertEquals(1, result, "Database connection test failed")
            println("[DEBUG_LOG] Database connection test successful")
        }
    }
}
