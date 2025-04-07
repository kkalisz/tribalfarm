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

@Serializable
@SerialName("WebSocketMessage")
sealed class WebSocketMessage {
    @Serializable
    @SerialName("Chat")
    data class Chat(val text: String) : WebSocketMessage()

    @Serializable
    @SerialName("Command")
    data class Command(val action: String) : WebSocketMessage()

    @Serializable
    @SerialName("Error")
    data class Error(val message: String) : WebSocketMessage()
}

class Connection(val session: DefaultWebSocketSession) {
    companion object {
        val lastId = AtomicInteger(0)
        val json = Json { 
            ignoreUnknownKeys = true 
            isLenient = true
            serializersModule = SerializersModule {
                polymorphic(WebSocketMessage::class) {
                    subclass(WebSocketMessage.Chat::class)
                    subclass(WebSocketMessage.Command::class)
                    subclass(WebSocketMessage.Error::class)
                }
            }
        }
    }
    val id = lastId.incrementAndGet()

    suspend fun send(message: WebSocketMessage) {
        val jsonString = json.encodeToString(WebSocketMessage.serializer(), message)
        println("[DEBUG_LOG] Sending message: $jsonString")
        session.send(Frame.Text(jsonString))
    }

    suspend fun broadcast(message: WebSocketMessage) {
        connections.values.forEach { it.send(message) }
    }
}

// Keep track of all connected clients
val connections = ConcurrentHashMap<Int, Connection>()

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
                for (frame in incoming) {
                    if (frame is Frame.Text) {
                        try {
                            val text = frame.readText()
                            println("[DEBUG_LOG] Received raw message: $text")
                            val message = if (text.startsWith("{")) {
                                try {
                                    val decoded = Connection.json.decodeFromString(WebSocketMessage.serializer(), text)
                                    println("[DEBUG_LOG] Successfully decoded message: $decoded")
                                    decoded
                                } catch (e: Exception) {
                                    println("[DEBUG_LOG] Failed to decode JSON: ${e.message}")
                                    try {
                                        // Try to parse as raw JSON to see if it's a command without proper type
                                        val jsonElement = Connection.json.parseToJsonElement(text)
                                        if (jsonElement.toString().contains("\"action\"")) {
                                            WebSocketMessage.Command(jsonElement.toString().substringAfter("\"action\":").substringAfter("\"").substringBefore("\""))
                                        } else {
                                            WebSocketMessage.Error("Invalid message format: $text")
                                        }
                                    } catch (e2: Exception) {
                                        WebSocketMessage.Error("Invalid JSON format: $text")
                                    }
                                }
                            } else {
                                // Treat non-JSON text as chat message
                                WebSocketMessage.Chat(text)
                            }

                            when (message) {
                                is WebSocketMessage.Chat -> {
                                    val chatMessage = WebSocketMessage.Chat("Client ${thisConnection.id} said: ${message.text}")
                                    thisConnection.broadcast(chatMessage)

                                    if (message.text.equals("bye", ignoreCase = true)) {
                                        close(CloseReason(CloseReason.Codes.NORMAL, "Client said BYE"))
                                    }
                                }
                                is WebSocketMessage.Command -> {
                                    when (message.action.lowercase()) {
                                        "quit", "exit", "bye" -> {
                                            close(CloseReason(CloseReason.Codes.NORMAL, "Client requested disconnect"))
                                        }
                                        else -> {
                                            thisConnection.send(WebSocketMessage.Error("Unknown command: ${message.action}"))
                                        }
                                    }
                                }
                                is WebSocketMessage.Error -> {
                                    // Log error messages but don't broadcast them
                                    println("Error message received: ${message.message}")
                                }
                                else -> {
                                    // This branch is technically unreachable since WebSocketMessage is sealed
                                    // but Kotlin compiler requires it for type safety
                                    thisConnection.send(WebSocketMessage.Error("Unsupported message type"))
                                }
                            }
                        } catch (e: Exception) {
                            thisConnection.send(WebSocketMessage.Error("Failed to process message: ${e.message}"))
                        }
                    }
                }
            } catch (e: Exception) {
                println("Error while receiving: " + e.localizedMessage)
            } finally {
                println("Removing user!")
                connections.remove(thisConnection.id)
            }
        }
    }
}
