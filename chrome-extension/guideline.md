# Tribal Wars Virtual Player - Chrome Extension Guidelines

## Project Overview

The Tribal Wars Virtual Player is a Chrome extension designed to automate and enhance gameplay in the Tribal Wars browser game. It provides a framework for executing automated actions, managing game state, and configuring player settings through a user interface.

## Architecture

The extension follows a modular architecture with clear separation of concerns:

### High-Level Components

1. **Background Service Worker**: Coordinates actions, manages WebSocket connections to backend, and handles command queues.
2. **Content Script**: Executes actions in the game page, parses DOM, and provides UI for configuration.
3. **Popup UI**: Provides configuration interface for player settings.
4. **Database**: Persists game data, player settings, and configuration across sessions.
5. **Action System**: Defines actions that can be executed in the game and handlers for these actions.

### Communication Flow

```
Backend Server <--> Background Service Worker <--> Content Script <--> Game Page DOM
                                              \
                                               \--> Popup UI
```

- **Background Service Worker** communicates with the backend server via WebSocket and with content scripts via Chrome messaging API.
- **Content Script** interacts with the game page DOM and communicates with the background service worker.
- **Popup UI** communicates with the background service worker to retrieve and update settings.

## Key Components

### Background Service Worker (`src/pages/background/index.ts`)

Responsibilities:
- Managing WebSocket connections to backend
- Command queue management
- Tab tracking and communication with content scripts
- Database initialization and access
- Player service coordination

Key Classes:
- `PlayerService`: Manages player-related functionality
- `ActionScheduler`: Schedules and executes actions
- `TabMessenger`: Communicates with content scripts

### Content Script (`src/pages/content/index.tsx`)

Responsibilities:
- DOM parsing and interaction
- UI action execution
- State management across page reloads
- Bot protection detection
- UI rendering for configuration

Key Classes:
- `ExecutorAttacher`: Attaches action handlers and executes commands
- `StateManager`: Manages state persistence across page reloads
- `ActionExecutor`: Base class for executing actions

### Database (`src/shared/db/GameDataBase.ts`)

The database uses IndexedDB (via the 'idb' library) to persist data across sessions. Each database instance is scoped to a specific game world domain.

Stores:
- `troopsCounts`: Stores troop counts for villages
- `playerSettings`: Stores player settings
- `worldConfig`: Stores world configuration
- `troopConfig`: Stores troop configuration
- `buildingConfig`: Stores building configuration

Key Classes:
- `GameDataBase`: Base class for database initialization
- `GameDataBaseAccess`: Provides methods for accessing database stores
- `GameDatabaseBackgroundSync`: Handles database synchronization in background
- `GameDatabaseClientSync`: Handles database synchronization in content script

### Action System

Actions are defined as interfaces with corresponding handlers. Each action has:
- A unique type identifier
- A payload with action-specific parameters
- A handler that executes the action

Examples:
- `NavigateToPageAction`: Navigates to a specific page in the game
- `ClickAction`: Clicks on a specific element in the game
- `FillInputAction`: Fills an input field in the game
- `ScavengeVillageAction`: Sends troops to scavenge resources

## Module Organization

```
src/
├── assets/              # Static assets
├── locales/             # Localization files
├── pages/
│   ├── background/      # Background service worker
│   ├── content/         # Content script
│   │   ├── execute/     # Action execution
│   │   ├── helpers/     # Helper functions
│   │   └── ui/          # UI components
│   └── popup/           # Popup UI
└── shared/
    ├── actions/         # Action definitions and handlers
    │   ├── backend/     # Actions initiated by backend
    │   └── content/     # Actions executed in content script
    ├── contexts/        # React contexts
    ├── db/              # Database implementation
    ├── helpers/         # Helper functions
    ├── hooks/           # React hooks
    ├── models/          # Data models
    │   └── game/        # Game-specific models
    ├── services/        # Service implementations
    └── ui/              # Shared UI components
```

## Development Guidelines

### Adding New Actions

1. Define the action interface in `shared/actions/[backend|content]/[category]/[ActionName].ts`
2. Create a constant for the action type
3. Implement the action handler in the same directory
4. Register the action handler in the appropriate place:
   - For content script actions: `ExecutorAttacher.registerActionHandlers()`
   - For backend actions: `ActionScheduler.registerActionHandlers()`

### Error Handling

- Use try/catch blocks for error handling
- Send error status messages back to the background service worker
- Implement recovery strategies for common errors
- Use the logging system for debugging

### State Management

- Use the database for persistent state
- Use `StateManager` for state that needs to persist across page reloads
- Use React contexts for state that needs to be shared across components

### Testing

- Implement unit tests for core components
- Test actions in isolation
- Test error handling and recovery
- Validate performance under load

## Best Practices

1. **Type Safety**: Use TypeScript interfaces and types for all data structures
2. **Error Handling**: Implement comprehensive error handling and recovery
3. **Performance**: Optimize DOM operations and message passing
4. **Security**: Validate input and handle edge cases
5. **Modularity**: Keep components small and focused on a single responsibility
6. **Documentation**: Document code with JSDoc comments and keep this guideline updated

## Troubleshooting

Common issues and solutions:

1. **Extension not working**: Check browser console for errors, verify that content script is injected
2. **Actions not executing**: Check if bot protection is active, verify DOM selectors
3. **Database errors**: Check if IndexedDB is supported and not blocked
4. **Communication errors**: Verify that background service worker is running

## Future Enhancements

Planned features and improvements:

1. Implement robust state tracking
2. Develop debugging UI
3. Add comprehensive logging
4. Implement automated tests
5. Optimize performance
6. Enhance reliability with better error recovery