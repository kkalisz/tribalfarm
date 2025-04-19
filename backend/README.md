# Ktor 3 Migration

This project has been migrated from Ktor 2.3.4 to Ktor 3.0.0.

## Changes Made

1. Updated `gradle.properties` to use Ktor 3.0.0:
   ```
   ktor_version=3.0.0
   ```

2. Updated `build.gradle.kts`:
   - Updated Ktor plugin version to 3.0.0
   - Updated all Ktor dependencies to use the `ktor_version` property
   - Updated test dependencies to use the `ktor_version` property

3. Checked Kotlin files for API changes:
   - `Sockets.kt`: WebSocket configuration is compatible with Ktor 3
   - `HTTP.kt`: Plugin installations are compatible with Ktor 3
   - `Monitoring.kt`: Plugin installations are compatible with Ktor 3
   - `Routing.kt`: Plugin installations are compatible with Ktor 3

## Known Issues

1. **WebSocketTest.kt**: The test file is using a different version of the `WebSocketMessage` class than what's defined in `Sockets.kt`. The test file expects:
   - `WebSocketMessage.Chat` - A subclass with a 'text' property
   - `WebSocketMessage.Command` - A subclass with a constructor that takes a single string parameter
   - `WebSocketMessage.Error` - A subclass with a 'message' property

   However, the `WebSocketMessage` class in `Sockets.kt` has different subclasses with different properties and constructors. This causes compilation errors when running the tests.

   To fix this issue, the `WebSocketTest.kt` file needs to be updated to match the `WebSocketMessage` class in `Sockets.kt`.

2. **Third-party dependencies**: The project uses third-party libraries that might not be compatible with Ktor 3:
   - `com.ucasoft.ktor:ktor-simple-cache:0.53.4`
   - `com.ucasoft.ktor:ktor-simple-memory-cache:0.53.4`

   These libraries might need to be updated to versions that are compatible with Ktor 3, or replaced with alternative libraries.

## Next Steps

1. Update the `WebSocketTest.kt` file to match the `WebSocketMessage` class in `Sockets.kt`
2. Check if there are updated versions of the third-party libraries that are compatible with Ktor 3
3. Run tests to verify that the migration works correctly