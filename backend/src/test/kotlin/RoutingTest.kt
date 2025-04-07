package com.bngdev.tribalfarm

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import io.ktor.server.application.*
import kotlin.test.*
import kotlinx.serialization.json.*

class RoutingTest {
    private fun Application.testModule() {
        configureRouting()
    }

    @Test
    fun testRoot() = testApplication {
        application {
            testModule()
        }
        client.get("/").apply {
            assertEquals(HttpStatusCode.OK, status)
            assertEquals("Tribal Farm Game Server", bodyAsText())
        }
    }

    @Test
    fun testGetPlayer() = testApplication {
        application {
            testModule()
        }
        client.get("/player/123").apply {
            assertEquals(HttpStatusCode.OK, status)
            val response = Json.decodeFromString<PlayerData>(bodyAsText())
            assertEquals("123", response.id)
            assertEquals("Player 123", response.name)
            assertEquals(0, response.resources.wood)
            assertEquals(0, response.resources.stone)
            assertEquals(0, response.resources.food)
        }
    }

    @Test
    fun testCreatePlayer() = testApplication {
        application {
            testModule()
        }
        val player = PlayerData(
            id = "456",
            name = "Test Player",
            resources = GameResources(wood = 10, stone = 5, food = 8)
        )
        client.post("/player") {
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(PlayerData.serializer(), player))
        }.apply {
            assertEquals(HttpStatusCode.Created, status)
            val response = Json.decodeFromString<PlayerData>(bodyAsText())
            assertEquals(player.id, response.id)
            assertEquals(player.name, response.name)
            assertEquals(player.resources.wood, response.resources.wood)
            assertEquals(player.resources.stone, response.resources.stone)
            assertEquals(player.resources.food, response.resources.food)
        }
    }

    @Test
    fun testGetGameState() = testApplication {
        application {
            testModule()
        }
        client.get("/game-state/789").apply {
            assertEquals(HttpStatusCode.OK, status)
            val response = Json.decodeFromString<GameStateData>(bodyAsText())
            assertEquals("789", response.player.id)
            assertEquals("Player 789", response.player.name)
            assertTrue(response.buildings.isEmpty())
        }
    }

    @Test
    fun testCollectResources() = testApplication {
        application {
            testModule()
        }
        client.post("/resources/123/collect").apply {
            assertEquals(HttpStatusCode.OK, status)
            val response = Json.decodeFromString<GameResources>(bodyAsText())
            assertTrue(response.wood in 10..20)
            assertTrue(response.stone in 5..15)
            assertTrue(response.food in 8..16)
        }
    }

    @Test
    fun testGetBuildings() = testApplication {
        application {
            testModule()
        }
        client.get("/buildings/123").apply {
            assertEquals(HttpStatusCode.OK, status)
            val response = Json.decodeFromString<List<Building>>(bodyAsText())
            assertEquals(2, response.size)
            assertEquals("FARM", response[0].type)
            assertEquals("WAREHOUSE", response[1].type)
        }
    }

    @Test
    fun testCreateBuilding() = testApplication {
        application {
            testModule()
        }
        val request = BuildingRequest(
            type = "FARM",
            position = Position(x = 10, y = 20)
        )
        client.post("/buildings/123") {
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(BuildingRequest.serializer(), request))
        }.apply {
            assertEquals(HttpStatusCode.Created, status)
            val response = Json.decodeFromString<Building>(bodyAsText())
            assertEquals("FARM", response.type)
            assertEquals(1, response.level)
        }
    }

    @Test
    fun testUpgradeBuilding() = testApplication {
        application {
            testModule()
        }
        client.put("/buildings/123/456/upgrade").apply {
            assertEquals(HttpStatusCode.OK, status)
            val response = Json.decodeFromString<Building>(bodyAsText())
            assertEquals("FARM", response.type)
            assertEquals(2, response.level)
        }
    }

    @Test
    fun testGetInventory() = testApplication {
        application {
            testModule()
        }
        client.get("/inventory/123").apply {
            assertEquals(HttpStatusCode.OK, status)
            val response = Json.decodeFromString<Inventory>(bodyAsText())
            assertEquals(2, response.items.size)
            assertEquals(100, response.capacity)
            assertEquals("SEED", response.items[0].type)
            assertEquals(10, response.items[0].quantity)
        }
    }

    @Test
    fun testAddInventoryItem() = testApplication {
        application {
            testModule()
        }
        val item = InventoryItem("TOOL", 1)
        client.post("/inventory/123/items") {
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(InventoryItem.serializer(), item))
        }.apply {
            assertEquals(HttpStatusCode.Created, status)
            val response = Json.decodeFromString<InventoryItem>(bodyAsText())
            assertEquals("TOOL", response.type)
            assertEquals(1, response.quantity)
        }
    }

    @Test
    fun testGetAchievements() = testApplication {
        application {
            testModule()
        }
        client.get("/achievements/123").apply {
            assertEquals(HttpStatusCode.OK, status)
            val response = Json.decodeFromString<List<Achievement>>(bodyAsText())
            assertEquals(2, response.size)
            assertTrue(response[0].completed)
            assertFalse(response[1].completed)
            assertEquals(450, response[1].progress)
        }
    }

    @Test
    fun testClaimAchievement() = testApplication {
        application {
            testModule()
        }
        client.post("/achievements/123/FIRST_FARM/claim").apply {
            assertEquals(HttpStatusCode.OK, status)
        }
    }

    @Test
    fun testTrade() = testApplication {
        application {
            testModule()
        }
        val request = TradeRequest(
            offer = GameResources(wood = 10, stone = 0, food = 0),
            request = GameResources(wood = 0, stone = 5, food = 0)
        )
        client.post("/trade/123") {
            contentType(ContentType.Application.Json)
            setBody(Json.encodeToString(TradeRequest.serializer(), request))
        }.apply {
            assertEquals(HttpStatusCode.OK, status)
            val response = Json.decodeFromString<GameResources>(bodyAsText())
            assertEquals(100, response.wood)
            assertEquals(100, response.stone)
            assertEquals(100, response.food)
        }
    }
}
