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

### React Component Development

#### Component Location and Structure

- All reusable UI components should be stored in: `/chrome-extension/src/shared/ui`
- Each component should be placed in its own folder with the following structure:
  ```
  /shared/ui/MyComponent/
  ├── index.ts         # Exports the component
  ├── MyComponent.tsx  # Contains the main component logic
  ├── types.ts         # Defines TypeScript interfaces or types (if needed)
  └── styles.ts        # Contains Chakra UI styles or theme overrides (if applicable)
  ```
- Use named exports for components (e.g., `export const MyComponent`)

#### Coding Standards

- Use TypeScript for all components to ensure type safety
- Follow React functional components with hooks (no class components)
- Use Chakra UI components for styling and layout to maintain a consistent look and feel
- Ensure components are responsive and accessible (follow ARIA guidelines where applicable)
- Write clean, modular, and reusable code, adhering to the DRY (Don't Repeat Yourself) principle
- Use modern JavaScript (ES6+) and avoid deprecated APIs

#### Data Handling

- For database interactions, use the following:
  - Database entities: Define in `/chrome-extension/src/shared/db/GameDataBase.ts`
  - Data access functions: Implement in `/chrome-extension/src/shared/db/GameDataBaseAccess.ts`
- For asynchronous data fetching within components, use the `useAsync` hook:
  ```typescript
  const { loading, error, data, execute } = useAsync(
    () => gameDatabase.settingDb.getPlayerSettings(), 
    []
  );
  ```
- Handle loading, error, and data states appropriately in the UI
- Ensure asynchronous operations are optimized to avoid unnecessary re-renders

#### Chakra UI Integration

- Always prefer components from the `/chrome-extension/src/shared/ui` folder (e.g., TribalButton, TribalTabs) over direct Chakra UI components when available
- Use Chakra UI's component library for UI elements only when a corresponding Tribal component doesn't exist
- Leverage Chakra UI's theme system for consistent styling
- Prefer CSS-in-JS with Chakra UI's sx prop or styled components for custom styles
- Avoid inline CSS or external stylesheets unless absolutely necessary
- Ensure components are compatible with Chakra UI's color mode (light/dark mode)

#### Performance Optimization

- Use React hooks like `useMemo` and `useCallback` to prevent unnecessary re-renders
- Avoid heavy computations in the render path; offload them to `useEffect` or `useAsync`
- Optimize component rendering by minimizing prop drilling and leveraging React Context when appropriate

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
7. **Accessibility**: Ensure UI components follow ARIA guidelines and are keyboard navigable
8. **Responsive Design**: Design components to work across different screen sizes

## Troubleshooting

Common issues and solutions:

1. **Extension not working**: Check browser console for errors, verify that content script is injected
2. **Actions not executing**: Check if bot protection is active, verify DOM selectors
3. **Database errors**: Check if IndexedDB is supported and not blocked
4. **Communication errors**: Verify that background service worker is running
5. **UI rendering issues**: Check Chakra UI theme configuration and component props

## Database Development

### Adding New Database Objects

To add a new database object type, follow these steps:

1. **Define the data model interface** in `/chrome-extension/src/shared/models/game/`:

   Create a new TypeScript interface file (e.g., `MyNewDataType.ts`) that defines the structure of your data object. Include a primary key field (usually `id`) and any other fields needed for your data model.

2. **Update the DatabaseSchema interface** in `GameDataBase.ts`:

   Add a new entry to the DatabaseSchema interface to define the store for your new data type. Specify the key and value types for the store.

3. **Add the object store in the database initialization** in `GameDataBase.ts`:

   In the `init` method of the GameDataBase class, add code to create a new object store for your data type if it doesn't already exist. Specify the keyPath for the store, which is usually the primary key field of your data model.

   **Important**: After adding new entities, you must update the database version (the second parameter in the openDB function) to trigger the upgrade callback and create the new object store.

### Adding Database Access Methods

After defining the database schema, add methods to access the data:

1. **Add methods to the GameDataBaseAccess class**:

   Create methods for CRUD operations on your new data type:
   - `saveMyNewDataType`: Save a single object
   - `saveMyNewDataTypes`: Save multiple objects
   - `getMyNewDataType`: Get a single object by ID
   - `getAllMyNewDataTypes`: Get all objects
   - `deleteMyNewDataType`: Delete a single object by ID
   - `deleteAllMyNewDataTypes`: Delete all objects

2. **Add methods to the settingDb object** (recommended approach):

   Add the same methods to the `settingDb` object in the GameDataBaseAccess class. This is the recommended approach for accessing the database, as it provides a more consistent API and groups related methods together.

### Using Database Access in Components

To use the database in React components:

1. **Import the useGameDatabase hook**:

   Import the `useGameDatabase` hook from `@src/shared/contexts/StorageContext`.

2. **Get the database instance**:

   Use the `useGameDatabase` hook to get an instance of the GameDataBaseAccess class.

3. **Use the database methods with proper error handling**:

   Use the database methods to perform CRUD operations on your data. Handle loading and error states appropriately.

   Example pattern:
   - Set loading state to true
   - Clear any previous errors
   - Try to perform the database operation
   - Update the component state with the result
   - Set loading state to false
   - Catch any errors and update the error state

4. **Handle loading and error states in the UI**:

   Display appropriate UI elements based on the loading and error states.

### Database Best Practices

1. **Use TypeScript interfaces** for all database models to ensure type safety
2. **Follow consistent naming conventions** for database methods:
   - `save[ModelName]` for saving a single object
   - `save[ModelName]s` for saving multiple objects
   - `get[ModelName]` for retrieving a single object
   - `getAll[ModelName]s` for retrieving all objects
   - `delete[ModelName]` for deleting a single object
   - `deleteAll[ModelName]s` for deleting all objects
3. **Handle errors properly** in database operations
4. **Use async/await** for all database operations
5. **Prefer the settingDb object** for database access to maintain consistency
6. **Implement proper loading and error states** in components that use database operations
7. **Use the useGameDatabase hook** to get the database instance in components
8. **Consider data migration strategies** when updating database schemas

### Real-World Example: VillageOverview

The VillageOverview implementation provides a good example of how to add a new database object and API:

1. **Data Model** (`BaseVillageInfo.ts`):
   - Defines the VillageOverview interface with fields like villageId, name, coordinates, etc.

2. **Database Schema** (`GameDataBase.ts`):
   - Adds the villageOverviews store to the DatabaseSchema interface
   - Creates the object store with villageId as the keyPath

3. **Database Access** (`GameDataBaseAccess.ts`):
   - Implements methods for saving, retrieving, and deleting VillageOverview objects
   - Adds these methods to both the class and the settingDb object

4. **Component Usage** (`LeftSidebar.tsx`):
   - Uses the useGameDatabase hook to get the database instance
   - Calls getAllVillageOverviews to fetch villages from the database
   - Maps the VillageOverview objects to the format needed by the UI
   - Handles loading and error states appropriately

## Shadow DOM Development

When working with Shadow DOM in the extension, especially with TypeScript, follow these key guidelines:

1. **Type Assertions**: Cast ShadowRoot to EventTarget for event listeners:
   ```typescript
   (shadowRoot as unknown as EventTarget).addEventListener('mousedown', handler);
   ```

2. **Event Types**: Use generic `Event` type instead of specific types like `MouseEvent`:
   ```typescript
   const handleClickOutside = (event: Event) => { /* ... */ };
   ```

3. **Context Verification**: Always check if an element is within Shadow DOM:
   ```typescript
   if (shadowRoot instanceof ShadowRoot) {
     // Shadow DOM-specific code
   } else {
     // Regular DOM fallback
   }
   ```

4. **Custom Hooks**: Create specialized hooks for Shadow DOM operations (e.g., `useShadowDomOutsideClick`)

5. **Debugging Tips**: Use generic types and apply type assertions only when necessary

## Future Enhancements

Planned features and improvements:

1. Implement robust state tracking
2. Develop debugging UI
3. Add comprehensive logging
4. Implement automated tests
5. Optimize performance
6. Enhance reliability with better error recovery
7. Improve UI/UX with more intuitive components
8. Add more customization options for player settings
