package com.bngdev.tribalfarm.user

import org.jetbrains.exposed.dao.UUIDEntity
import org.jetbrains.exposed.dao.UUIDEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.javatime.datetime
import java.time.LocalDateTime
import java.util.UUID

object Users : UUIDTable() {
    val username: Column<String> = varchar("username", 50).uniqueIndex()
    val email: Column<String> = varchar("email", 255).uniqueIndex()
    val passwordHash: Column<String> = varchar("password_hash", 255)
    val createdAt: Column<LocalDateTime> = datetime("created_at")
    val updatedAt: Column<LocalDateTime> = datetime("updated_at")
    val lastLoginAt: Column<LocalDateTime?> = datetime("last_login_at").nullable()
}

class User(id: EntityID<UUID>) : UUIDEntity(id) {
    companion object : UUIDEntityClass<User>(Users)

    var username by Users.username
    var email by Users.email
    var passwordHash by Users.passwordHash
    var createdAt by Users.createdAt
    var updatedAt by Users.updatedAt
    var lastLoginAt by Users.lastLoginAt

    fun toDTO(): UserDTO = UserDTO(
        id = id.value,
        username = username,
        email = email,
        createdAt = createdAt,
        updatedAt = updatedAt,
        lastLoginAt = lastLoginAt
    )
}

data class UserDTO(
    val id: UUID,
    val username: String,
    val email: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val lastLoginAt: LocalDateTime?
)

data class CreateUserDTO(
    val username: String,
    val email: String,
    val password: String
)