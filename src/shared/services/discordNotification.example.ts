/**
 * Discord Notification Service - Usage Examples
 * 
 * This file provides examples of how to use the Discord notification service
 * in different scenarios within the Chrome extension.
 */

import { DiscordNotificationService, createDiscordNotificationService } from './discordNotification';

/**
 * Example: Basic usage of the Discord notification service
 */
async function basicUsageExample() {
  // Create a new Discord notification service with your webhook URL
  // Replace this URL with your actual Discord webhook URL
  const webhookUrl = 'https://discord.com/api/webhooks/your-webhook-id/your-webhook-token';
  const discordService = createDiscordNotificationService(webhookUrl);
  
  // Send a simple text message
  await discordService.sendMessage('Hello from Tribal Wars Virtual Player!');
  
  // Send a message with a custom username
  await discordService.sendMessage(
    'This message appears with a custom username', 
    'Tribal Wars Bot'
  );
}

/**
 * Example: Sending different types of notifications
 */
async function notificationTypesExample() {
  const webhookUrl = 'https://discord.com/api/webhooks/your-webhook-id/your-webhook-token';
  const discordService = createDiscordNotificationService(webhookUrl);
  
  // Send an info notification
  await discordService.sendInfoNotification(
    'Information', 
    'This is an informational message',
    [
      { name: 'Server', value: 'en123.tribalwars.net', inline: true },
      { name: 'Player', value: 'PlayerName', inline: true }
    ]
  );
  
  // Send a success notification
  await discordService.sendSuccessNotification(
    'Success!', 
    'The operation completed successfully',
    [
      { name: 'Operation', value: 'Resource Collection', inline: true },
      { name: 'Resources', value: 'Wood: 1000, Clay: 800, Iron: 600', inline: false }
    ]
  );
  
  // Send a warning notification
  await discordService.sendWarningNotification(
    'Warning', 
    'Low resources detected',
    [
      { name: 'Village', value: 'Main Village (500|500)', inline: true },
      { name: 'Resource', value: 'Iron', inline: true },
      { name: 'Current Amount', value: '200', inline: true }
    ]
  );
  
  // Send an error notification
  try {
    // Simulate an error
    throw new Error('Failed to connect to game server');
  } catch (error) {
    await discordService.sendErrorNotification(
      'Error Occurred', 
      'An error occurred while connecting to the game server',
      error as Error,
      [
        { name: 'Time', value: new Date().toISOString(), inline: true },
        { name: 'Server', value: 'en123.tribalwars.net', inline: true }
      ]
    );
  }
}

/**
 * Example: Sending game event notifications
 */
async function gameEventExample() {
  const webhookUrl = 'https://discord.com/api/webhooks/your-webhook-id/your-webhook-token';
  const discordService = createDiscordNotificationService(webhookUrl);
  
  // Notify about an incoming attack
  await discordService.sendGameEventNotification(
    'attack',
    'Incoming Attack',
    'Your village is under attack!',
    {
      'Village': 'Main Village (500|500)',
      'Attacker': 'EnemyPlayer',
      'Arrival Time': '2025-07-14 17:30:00',
      'Estimated Troops': 'Unknown'
    }
  );
  
  // Notify about resource collection
  await discordService.sendGameEventNotification(
    'resource',
    'Resources Collected',
    'Scavenging mission completed',
    {
      'Village': 'Second Village (505|510)',
      'Wood': '1500',
      'Clay': '1200',
      'Iron': '900',
      'Duration': '2 hours'
    }
  );
  
  // Notify about building completion
  await discordService.sendGameEventNotification(
    'build',
    'Building Completed',
    'A building has been upgraded',
    {
      'Village': 'Main Village (500|500)',
      'Building': 'Barracks',
      'Level': '10',
      'Completion Time': '2025-07-14 16:45:00'
    }
  );
}

/**
 * Example: Integration with background service worker
 * 
 * This example shows how you might integrate the Discord notification service
 * with the extension's background service worker.
 */
function backgroundServiceIntegration() {
  // In your background service worker initialization code:
  
  // 1. Get the webhook URL from storage or configuration
  chrome.storage.sync.get(['discordWebhookUrl'], async (result) => {
    if (result.discordWebhookUrl) {
      // 2. Create the Discord notification service
      const discordService = createDiscordNotificationService(result.discordWebhookUrl);
      
      // 3. Store the service instance for later use
      // (You would typically store this in a service or context)
      
      // 4. Send a notification that the extension has started
      await discordService.sendInfoNotification(
        'Extension Started',
        'The Tribal Wars Virtual Player extension has started',
        [
          { name: 'Time', value: new Date().toISOString(), inline: true },
          { name: 'Version', value: chrome.runtime.getManifest().version, inline: true }
        ]
      );
    }
  });
  
  // // Later, when events occur, you can send notifications:
  // async function handleImportantEvent(eventData: any) {
  //   // Get the service instance (from wherever you stored it)
  //   const discordService = getDiscordService(); // This is a placeholder function
  //
  //   if (discordService) {
  //     await discordService.sendGameEventNotification(
  //       eventData.type,
  //       eventData.title,
  //       eventData.description,
  //       eventData.details
  //     );
  //   }
  // }
}

/**
 * Example: Using the service in a React component
 * 
 * This example shows how you might use the Discord notification service
 * in a React component.
 */
/*
import React, { useState, useEffect } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { createDiscordNotificationService } from '@src/shared/services/discordNotification';

// This is a simplified example of a React component that uses the Discord notification service
const NotificationTestComponent: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const toast = useToast();
  
  // Load the webhook URL from storage
  useEffect(() => {
    chrome.storage.sync.get(['discordWebhookUrl'], (result) => {
      if (result.discordWebhookUrl) {
        setWebhookUrl(result.discordWebhookUrl);
      }
    });
  }, []);
  
  // Send a test notification
  const sendTestNotification = async () => {
    if (!webhookUrl) {
      toast({
        title: 'Error',
        description: 'Please configure a Discord webhook URL first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const discordService = createDiscordNotificationService(webhookUrl);
      await discordService.sendInfoNotification(
        'Test Notification',
        'This is a test notification from the Tribal Wars Virtual Player extension',
        [
          { name: 'Time', value: new Date().toISOString(), inline: true },
          { name: 'Test ID', value: Math.random().toString(36).substring(7), inline: true }
        ]
      );
      
      toast({
        title: 'Success',
        description: 'Test notification sent successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to send notification: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Button
      colorScheme="blue"
      isLoading={isSending}
      loadingText="Sending..."
      onClick={sendTestNotification}
    >
      Send Test Notification
    </Button>
  );
};

export default NotificationTestComponent;
*/