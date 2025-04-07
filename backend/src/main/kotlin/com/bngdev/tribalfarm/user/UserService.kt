package com.bngdev.tribalfarm.user

import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime
import java.util.UUID
import org.mindrot.jbcrypt.BCrypt

class UserService {
    fun createUser(createUserDTO: CreateUserDTO): UserDTO = transaction {
        val now = LocalDateTime.now()
        User.new {
            username = createUserDTO.username
            email = createUserDTO.email
            passwordHash = hashPassword(createUserDTO.password)
            createdAt = now
            updatedAt = now
        }.toDTO()
    }

    fun findUserByUsername(username: String): UserDTO? = transaction {
        User.find { Users.username eq username }.firstOrNull()?.toDTO()
    }

    fun findUserByEmail(email: String): UserDTO? = transaction {
        User.find { Users.email eq email }.firstOrNull()?.toDTO()
    }

    fun validateCredentials(username: String, password: String): UserDTO? = transaction {
        val user = User.find { Users.username eq username }.firstOrNull()
        if (user != null && checkPassword(password, user.passwordHash)) {
            user.lastLoginAt = LocalDateTime.now()
            user.toDTO()
        } else {
            null
        }
    }

    fun updateLastLogin(userId: UUID) = transaction {
        User.findById(userId)?.apply {
            lastLoginAt = LocalDateTime.now()
        }
    }

    private fun hashPassword(password: String): String {
        return BCrypt.hashpw(password, BCrypt.gensalt())
    }

    private fun checkPassword(password: String, hash: String): Boolean {
        return BCrypt.checkpw(password, hash)
    }
}