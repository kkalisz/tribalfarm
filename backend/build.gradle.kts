val kotlin_version = "2.1.0"// Must match the Kotlin version below (2.1.0)
val logback_version: String by project
val ktor_version = "3.1.2"

plugins {
    id("org.jetbrains.kotlin.jvm") version "2.1.0" // Matches the Kotlin compiler version
    id("io.ktor.plugin") version "3.1.2"
    id("org.jetbrains.kotlin.plugin.serialization") version "2.1.0"
    //id("org.jlleitschuh.gradle.ktlint") version "12.2.0"
}

application {
    mainClass.set("io.ktor.server.netty.EngineMain")

    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

//ktlint {
//    version.set("1.5.0")
//    verbose.set(true)
//    outputToConsole.set(true)
//    enableExperimentalRules.set(true)
//    filter {
//        exclude("**/generated/**")
//        include("**/kotlin/**")
//    }
//}

dependencies {
    // Ktor dependencies - add explicit Kotlin compatibility versions
    implementation("io.ktor:ktor-server-core:$ktor_version")
    implementation("io.ktor:ktor-server-auth:$ktor_version")
    implementation("io.ktor:ktor-server-content-negotiation:$ktor_version")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktor_version")
    implementation("io.ktor:ktor-server-sessions:$ktor_version")
    implementation("io.ktor:ktor-server-auto-head-response:$ktor_version")
    implementation("io.ktor:ktor-server-resources:$ktor_version")
    implementation("io.ktor:ktor-server-host-common:$ktor_version")
    implementation("io.ktor:ktor-server-status-pages:$ktor_version")
    implementation("io.ktor:ktor-server-caching-headers:$ktor_version")
    implementation("io.ktor:ktor-server-conditional-headers:$ktor_version")
    implementation("io.ktor:ktor-server-default-headers:$ktor_version")
    implementation("io.ktor:ktor-server-call-logging:$ktor_version")
    implementation("io.ktor:ktor-server-call-id:$ktor_version")
    implementation("io.ktor:ktor-server-websockets:$ktor_version")
    implementation("io.ktor:ktor-server-netty:$ktor_version")
    implementation("io.ktor:ktor-server-config-yaml:$ktor_version")

    // Caching libraries
    implementation("com.ucasoft.ktor:ktor-simple-cache:0.53.4")
    implementation("com.ucasoft.ktor:ktor-simple-memory-cache:0.53.4")

    // Logging
    implementation("ch.qos.logback:logback-classic:$logback_version")

    // Database libraries
    implementation("org.jetbrains.exposed:exposed-core:0.41.1")
    implementation("org.jetbrains.exposed:exposed-dao:0.41.1")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.41.1")
    implementation("org.jetbrains.exposed:exposed-java-time:0.41.1")
    implementation("org.postgresql:postgresql:42.6.0")
    implementation("com.zaxxer:HikariCP:5.0.1")
    implementation("org.mindrot:jbcrypt:0.4")

    // Test dependencies
    testImplementation("io.ktor:ktor-server-test-host:$ktor_version")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version")
    testImplementation("com.h2database:h2:2.1.214")
}

//configurations.all {
//    resolutionStrategy.eachDependency {
//        if (requested.group == "org.jetbrains.kotlin") {
//            useVersion("2.1.0") // Force all Kotlin-related dependencies to use version 2.1.0
//        }
//    }
//}
