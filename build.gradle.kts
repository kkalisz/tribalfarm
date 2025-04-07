plugins {
    kotlin("jvm") version "2.1.20" apply false
    kotlin("plugin.serialization") version "2.1.20" apply false
    id("io.ktor.plugin") version "3.1.2" apply false
}

allprojects {
    group = "com.tribalfarm"
    version = "0.0.1"

    repositories {
        mavenCentral()
    }
}

subprojects {
    apply(plugin = "org.jetbrains.kotlin.jvm")
}
