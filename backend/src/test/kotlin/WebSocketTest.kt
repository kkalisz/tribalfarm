package com.bngdev.tribalfarm

import io.ktor.client.plugins.websocket.*
import io.ktor.server.testing.*
import io.ktor.websocket.*
import kotlin.test.*
import io.ktor.client.request.*
import io.ktor.client.HttpClient
import io.ktor.server.websocket.*
import kotlinx.coroutines.runBlocking
import kotlin.time.Duration.Companion.seconds
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

class WebSocketTest {
    private val json = Json { 
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

    @Test
    fun testWebSocketBasic() = testApplication {
        application {
            configureSockets()
        }

        val client = createClient {
            install(io.ktor.client.plugins.websocket.WebSockets) {
                pingInterval = 15.seconds
            }
        }

        client.webSocket("/ws") {
            // Send a test message
            send(Frame.Text("Hello"))

            // Receive the response
            val response = (incoming.receive() as Frame.Text).readText()
            val message = json.decodeFromString<WebSocketMessage>(response) as WebSocketMessage.Chat
            assertTrue(message.text.matches(Regex("Client \\d+ said: Hello")))

            // Test the bye message
            send(Frame.Text("bye"))
            val closeReason = closeReason.await()
            assertEquals(CloseReason.Codes.NORMAL, closeReason?.knownReason)
        }
    }

    @Test
    fun testMultipleConnections() = testApplication {
        application {
            configureSockets()
        }

        val client1 = createClient {
            install(io.ktor.client.plugins.websocket.WebSockets) {
                pingInterval = 15.seconds
            }
        }

        val client2 = createClient {
            install(io.ktor.client.plugins.websocket.WebSockets) {
                pingInterval = 15.seconds
            }
        }

        client1.webSocket("/ws") {
            client2.webSocket("/ws") {
                // Client 1 sends a message
                send(Frame.Text("Hello from client 2"))

                // Both clients should receive the message
                val response1 = (incoming.receive() as Frame.Text).readText()
                val message1 = json.decodeFromString<WebSocketMessage>(response1) as WebSocketMessage.Chat
                assertTrue(message1.text.matches(Regex("Client \\d+ said: Hello from client 2")))
            }

            // Client 1 receives the message
            val response2 = (incoming.receive() as Frame.Text).readText()
            val message2 = json.decodeFromString<WebSocketMessage>(response2) as WebSocketMessage.Chat
            assertTrue(message2.text.matches(Regex("Client \\d+ said: Hello from client 2")))
        }
    }

    @Test
    fun testJsonMessages() = testApplication {
        application {
            configureSockets()
        }

        val client = createClient {
            install(io.ktor.client.plugins.websocket.WebSockets) {
                pingInterval = 15.seconds
            }
        }

        client.webSocket("/ws") {
            // Send a chat message in JSON format
            val chatMessage = WebSocketMessage.Chat("Hello JSON")
            val jsonString = json.encodeToString(WebSocketMessage.serializer(), chatMessage)
            println("[DEBUG_LOG] Sending message: $jsonString")
            send(Frame.Text(jsonString))

            // Receive and verify the response
            val response = (incoming.receive() as Frame.Text).readText()
            println("[DEBUG_LOG] Received response: $response")
            val message = json.decodeFromString(WebSocketMessage.serializer(), response) as WebSocketMessage.Chat
            println("[DEBUG_LOG] Decoded message: $message")
            assertTrue(message.text.matches(Regex("Client \\d+ said: Hello JSON")))

            // Test command message
            val commandMessage = WebSocketMessage.Command("unknown")
            val commandJson = json.encodeToString(WebSocketMessage.serializer(), commandMessage)
            println("[DEBUG_LOG] Sending command: $commandJson")
            send(Frame.Text(commandJson))

            // Should receive error for unknown command
            val errorResponse = (incoming.receive() as Frame.Text).readText()
            val errorMessage = json.decodeFromString<WebSocketMessage>(errorResponse) as WebSocketMessage.Error
            assertEquals("Unknown command: unknown", errorMessage.message)

            // Test quit command
            val quitCommand = WebSocketMessage.Command("quit")
            send(Frame.Text(json.encodeToString(quitCommand)))
            val closeReason = closeReason.await()
            assertEquals(CloseReason.Codes.NORMAL, closeReason?.knownReason)
        }
    }
}
