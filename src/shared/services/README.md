# Discord Notification Service

## Overview

The Discord Notification Service provides functionality to send notifications to Discord via webhooks from the Tribal Wars Virtual Player Chrome extension. It allows sending various types of notifications including simple text messages, info notifications, success notifications, warning notifications, error notifications, and game event notifications.

## Files

- `discordNotification.ts` - The main service implementation
- `discordNotification.example.ts` - Examples of how to use the service in different scenarios

## Usage

### Basic Usage

```typescript
import { createDiscordNotificationService } from '@src/shared/services/discordNotification';

// Create a new Discord notification service with your webhook URL
const webhookUrl = 'https://discord.com/api/webhooks/your-webhook-id/your-webhook-token';
const discordService = createDiscordNotificationService(webhookUrl);

// Send a simple text message
await discordService.sendMessage('Hello from Tribal Wars Virtual Player!');
```

### Notification Types

The service provides several specialized methods for different types of notifications:

- `sendMessage` - Sends a simple text message
- `sendInfoNotification` - Sends an info notification with blue color
- `sendSuccessNotification` - Sends a success notification with green color
- `sendWarningNotification` - Sends a warning notification with yellow color
- `sendErrorNotification` - Sends an error notification with red color and optional error details
- `sendGameEventNotification` - Sends a game event notification with color based on event type

### Integration Points

The Discord notification service can be integrated with various parts of the extension:

1. **Background Service Worker** - For sending notifications about extension events, errors, or status updates
2. **Content Scripts** - For sending notifications about game events or actions
3. **React Components** - For providing notification functionality in the UI

## Security Considerations

- The webhook URL should be stored securely, preferably in the extension's storage
- The service uses the standard fetch API which is compatible with Chrome extension security policies
- Error handling is implemented to prevent sensitive information from being exposed

## Future Enhancements

Potential future enhancements for the Discord notification service:

1. **Rate Limiting** - Implement rate limiting to prevent excessive notifications
2. **Notification Batching** - Group similar notifications together to reduce noise
3. **User Preferences** - Allow users to configure which types of notifications they want to receive
4. **Notification Templates** - Create predefined templates for common notification types
5. **Notification History** - Store a history of sent notifications for reference

## Example Implementation

See `discordNotification.example.ts` for detailed examples of how to use the service in different scenarios.