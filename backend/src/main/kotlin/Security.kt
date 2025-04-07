package com.bngdev.tribalfarm

import com.bngdev.tribalfarm.user.CreateUserDTO
import com.bngdev.tribalfarm.user.UserService
import com.ucasoft.ktor.simpleCache.SimpleCache
import com.ucasoft.ktor.simpleCache.cacheOutput
import com.ucasoft.ktor.simpleMemoryCache.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.resources.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.plugins.autohead.*
import io.ktor.server.plugins.cachingheaders.*
import io.ktor.server.plugins.callid.*
import io.ktor.server.plugins.calllogging.*
import io.ktor.server.plugins.conditionalheaders.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.defaultheaders.*
import io.ktor.server.plugins.NotFoundException
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.request.*
import io.ktor.server.resources.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import java.util.UUID
import kotlin.random.Random
import kotlin.time.Duration.Companion.days
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import org.slf4j.event.*
import javax.crypto.spec.SecretKeySpec

private fun hexStringToByteArray(hexString: String): ByteArray {
    val len = hexString.length
    val data = ByteArray(len / 2)
    var i = 0
    while (i < len) {
        data[i / 2] = ((Character.digit(hexString[i], 16) shl 4) + Character.digit(hexString[i + 1], 16)).toByte()
        i += 2
    }
    return data
}

@Serializable
data class UserSession(
    @Contextual
    val userId: UUID,
    val username: String
)

@Serializable
data class LoginCredentials(
    val username: String,
    val password: String
)

fun Application.configureSecurity() {
    val userService = UserService()

    install(Sessions) {
        cookie<UserSession>("USER_SESSION") {
            cookie.extensions["SameSite"] = "lax"
            cookie.secure = true
            cookie.httpOnly = true
            cookie.maxAge = 7.days

            val secretSignKey = hexStringToByteArray("00112233445566778899aabbccddeeff")
            val secretEncryptKey = hexStringToByteArray("0123456789abcdef0123456789abcdef")

            transform(SessionTransportTransformerEncrypt(
                encryptionKey = secretEncryptKey,
                signKey = secretSignKey
            ))
        }
    }

    authentication {
        session<UserSession>("auth-session") {
            validate { session ->
                userService.findUserByUsername(session.username)?.let {
                    UserIdPrincipal(it.username)
                }
            }
            challenge {
                call.respond(HttpStatusCode.Unauthorized)
            }
        }
    }

    routing {
        post("/api/register") {
            val createUserDTO = call.receive<CreateUserDTO>()

            // Check if user already exists
            if (userService.findUserByUsername(createUserDTO.username) != null) {
                call.respond(HttpStatusCode.Conflict, "Username already exists")
                return@post
            }
            if (userService.findUserByEmail(createUserDTO.email) != null) {
                call.respond(HttpStatusCode.Conflict, "Email already exists")
                return@post
            }

            val user = userService.createUser(createUserDTO)
            call.respond(user)
        }

        post("/api/login") {
            val credentials = call.receive<LoginCredentials>()
            val user = userService.validateCredentials(credentials.username, credentials.password)
            if (user != null) {
                val session = UserSession(user.id, user.username)
                call.sessions.set(session)
                call.respond(user)
            } else {
                call.respond(HttpStatusCode.Unauthorized, "Invalid credentials")
            }
        }

        authenticate("auth-session") {
            get("/api/user/profile") {
                val session = call.principal<UserSession>()!!
                val user = userService.findUserByUsername(session.username)
                    ?: throw NotFoundException("User not found")
                call.respond(user)
            }

            get("/api/logout") {
                call.sessions.clear<UserSession>()
                call.respond(HttpStatusCode.OK)
            }
        }
    }
}

@Serializable
data class MySession(val count: Int = 0)
