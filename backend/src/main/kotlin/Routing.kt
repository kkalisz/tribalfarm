package com.bngdev.tribalfarm

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.autohead.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import kotlin.random.Random

fun Application.configureRouting() {
    install(AutoHeadResponse)
    install(ContentNegotiation) {
        json()
    }
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.respondText(text = "500: $cause", status = HttpStatusCode.InternalServerError)
        }
    }
    routing {
        get("/") {
            call.respondText("Tribal Farm Game Server")
        }

        // Player endpoints
        get("/player/{id}") {
            val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest)
            val player = PlayerData(
                id = id,
                name = "Player $id",
                resources = GameResources()
            )
            call.respond(player)
        }

        post("/player") {
            val player = call.receive<PlayerData>()
            // TODO: Save player to database
            call.respond(HttpStatusCode.Created, player)
        }

        // Game state endpoints
        get("/game-state/{playerId}") {
            val playerId = call.parameters["playerId"] ?: return@get call.respond(HttpStatusCode.BadRequest)
            val gameState = GameStateData(
                player = PlayerData(
                    id = playerId,
                    name = "Player $playerId",
                    resources = GameResources()
                ),
                buildings = listOf()
            )
            call.respond(gameState)
        }

        // Resource management endpoints
        post("/resources/{playerId}/collect") {
            val playerId = call.parameters["playerId"] ?: return@post call.respond(HttpStatusCode.BadRequest)
            val resources = GameResources(
                wood = Random.nextInt(10, 20),
                stone = Random.nextInt(5, 15),
                food = Random.nextInt(8, 16)
            )
            call.respond(resources)
        }

        // Building management endpoints
        get("/buildings/{playerId}") {
            val playerId = call.parameters["playerId"] ?: return@get call.respond(HttpStatusCode.BadRequest)
            val buildings = listOf(
                Building("1", "FARM", 1),
                Building("2", "WAREHOUSE", 1)
            )
            call.respond(buildings)
        }

        post("/buildings/{playerId}") {
            val playerId = call.parameters["playerId"] ?: return@post call.respond(HttpStatusCode.BadRequest)
            val buildingRequest = call.receive<BuildingRequest>()
            val newBuilding = Building(
                id = Random.nextInt(1000, 9999).toString(),
                type = buildingRequest.type,
                level = 1
            )
            // TODO: Save building to database and deduct resources
            call.respond(HttpStatusCode.Created, newBuilding)
        }

        put("/buildings/{playerId}/{buildingId}/upgrade") {
            val playerId = call.parameters["playerId"] ?: return@put call.respond(HttpStatusCode.BadRequest)
            val buildingId = call.parameters["buildingId"] ?: return@put call.respond(HttpStatusCode.BadRequest)
            val building = Building(
                id = buildingId,
                type = "FARM", // TODO: Get actual building type from database
                level = 2 // TODO: Increment actual level from database
            )
            // TODO: Validate resources and update in database
            call.respond(building)
        }

        // Trading endpoints
        post("/trade/{playerId}") {
            val playerId = call.parameters["playerId"] ?: return@post call.respond(HttpStatusCode.BadRequest)
            val tradeRequest = call.receive<TradeRequest>()
            // TODO: Validate resources and perform trade
            val updatedResources = GameResources(
                wood = 100,
                stone = 100,
                food = 100
            )
            call.respond(updatedResources)
        }

        // Inventory endpoints
        get("/inventory/{playerId}") {
            val playerId = call.parameters["playerId"] ?: return@get call.respond(HttpStatusCode.BadRequest)
            val inventory = Inventory(
                items = listOf(
                    InventoryItem("SEED", 10),
                    InventoryItem("TOOL", 5)
                ),
                capacity = 100
            )
            call.respond(inventory)
        }

        post("/inventory/{playerId}/items") {
            val playerId = call.parameters["playerId"] ?: return@post call.respond(HttpStatusCode.BadRequest)
            val item = call.receive<InventoryItem>()
            // TODO: Validate inventory space and save to database
            call.respond(HttpStatusCode.Created, item)
        }

        // Achievement endpoints
        get("/achievements/{playerId}") {
            val playerId = call.parameters["playerId"] ?: return@get call.respond(HttpStatusCode.BadRequest)
            val achievements = listOf(
                Achievement(
                    id = "FIRST_FARM",
                    title = "First Farm",
                    description = "Built your first farm",
                    completed = true
                ),
                Achievement(
                    id = "RESOURCE_MASTER",
                    title = "Resource Master",
                    description = "Collect 1000 resources",
                    completed = false,
                    progress = 450
                )
            )
            call.respond(achievements)
        }

        post("/achievements/{playerId}/{achievementId}/claim") {
            val playerId = call.parameters["playerId"] ?: return@post call.respond(HttpStatusCode.BadRequest)
            val achievementId = call.parameters["achievementId"] ?: return@post call.respond(HttpStatusCode.BadRequest)
            // TODO: Validate achievement completion and give rewards
            call.respond(HttpStatusCode.OK)
        }
    }
}

@Serializable
data class InventoryItem(
    val type: String,
    val quantity: Int
)

@Serializable
data class Inventory(
    val items: List<InventoryItem>,
    val capacity: Int
)

@Serializable
data class Achievement(
    val id: String,
    val title: String,
    val description: String,
    val completed: Boolean,
    val progress: Int = 0
)

@Serializable
data class BuildingRequest(
    val type: String,
    val position: Position? = null
)

@Serializable
data class Position(
    val x: Int,
    val y: Int
)

@Serializable
data class TradeRequest(
    val offer: GameResources,
    val request: GameResources
)

@Serializable
data class PlayerData(
    val id: String,
    val name: String,
    val resources: GameResources
)

@Serializable
data class GameResources(
    val wood: Int = 0,
    val stone: Int = 0,
    val food: Int = 0
)

@Serializable
data class GameStateData(
    val player: PlayerData,
    val buildings: List<Building>
)

@Serializable
data class Building(
    val id: String,
    val type: String,
    val level: Int
)
