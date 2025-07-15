/**
 * Discord Notification Service
 * 
 * This service provides functionality to send notifications to Discord via webhooks.
 * It's designed to work within the Chrome extension environment and follows the project's
 * architectural patterns.
 */

/**
 * Interface for Discord message embeds
 */
export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number; // Decimal color value
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  timestamp?: string; // ISO string
  footer?: {
    text: string;
    icon_url?: string;
  };
  thumbnail?: {
    url: string;
  };
  image?: {
    url: string;
  };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
  };
}

/**
 * Interface for Discord webhook message payload
 */
export interface DiscordWebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
  tts?: boolean;
}

/**
 * Discord notification service for sending messages to Discord via webhooks
 */
export class DiscordNotificationService {

  /**
   * Creates a new Discord notification service
   * @param webhookUrl The Discord webhook URL to send notifications to
   */
  constructor(private webhookUrl?: string) {
  }

  /**
   * Sends a notification to Discord
   * @param payload The webhook payload to send
   * @returns A promise that resolves when the notification is sent
   */
  public async sendNotification(payload: DiscordWebhookPayload): Promise<void> {
    if(!this.webhookUrl){
      console.log("Notification Webhook URL is missing");
      return;
    }
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discord webhook error (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
      throw error;
    }
  }

  /**
   * Sends a simple text message to Discord
   * @param message The message content
   * @param username Optional username to display
   * @returns A promise that resolves when the notification is sent
   */
  public async sendMessage(message: string, username?: string): Promise<void> {
    const payload: DiscordWebhookPayload = {
      content: message
    };

    if (username) {
      payload.username = username;
    }

    return this.sendNotification(payload);
  }

  /**
   * Sends an info notification to Discord
   * @param title The title of the notification
   * @param description The description/content of the notification
   * @param fields Optional fields to include in the embed
   * @returns A promise that resolves when the notification is sent
   */
  public async sendInfoNotification(
    title: string, 
    description: string, 
    fields?: Array<{ name: string; value: string; inline?: boolean }>
  ): Promise<void> {
    const embed: DiscordEmbed = {
      title,
      description,
      color: 3447003, // Blue color
      timestamp: new Date().toISOString(),
      fields
    };

    return this.sendNotification({
      embeds: [embed]
    });
  }

  /**
   * Sends a success notification to Discord
   * @param title The title of the notification
   * @param description The description/content of the notification
   * @param fields Optional fields to include in the embed
   * @returns A promise that resolves when the notification is sent
   */
  public async sendSuccessNotification(
    title: string, 
    description: string, 
    fields?: Array<{ name: string; value: string; inline?: boolean }>
  ): Promise<void> {
    const embed: DiscordEmbed = {
      title,
      description,
      color: 5763719, // Green color
      timestamp: new Date().toISOString(),
      fields
    };

    return this.sendNotification({
      embeds: [embed]
    });
  }

  /**
   * Sends a warning notification to Discord
   * @param title The title of the notification
   * @param description The description/content of the notification
   * @param fields Optional fields to include in the embed
   * @returns A promise that resolves when the notification is sent
   */
  public async sendWarningNotification(
    title: string, 
    description: string, 
    fields?: Array<{ name: string; value: string; inline?: boolean }>
  ): Promise<void> {
    const embed: DiscordEmbed = {
      title,
      description,
      color: 16776960, // Yellow color
      timestamp: new Date().toISOString(),
      fields
    };

    return this.sendNotification({
      embeds: [embed]
    });
  }

  /**
   * Sends an error notification to Discord
   * @param title The title of the notification
   * @param description The description/content of the notification
   * @param error Optional error object to include details from
   * @param fields Optional fields to include in the embed
   * @returns A promise that resolves when the notification is sent
   */
  public async sendErrorNotification(
    title: string, 
    description: string, 
    error?: Error,
    fields?: Array<{ name: string; value: string; inline?: boolean }>
  ): Promise<void> {
    const allFields = fields || [];
    
    if (error) {
      allFields.push({
        name: 'Error',
        value: error.message
      });
      
      if (error.stack) {
        allFields.push({
          name: 'Stack Trace',
          value: error.stack.substring(0, 1000) // Limit stack trace length
        });
      }
    }

    const embed: DiscordEmbed = {
      title,
      description,
      color: 15158332, // Red color
      timestamp: new Date().toISOString(),
      fields: allFields
    };

    return this.sendNotification({
      embeds: [embed]
    });
  }

  /**
   * Sends a game event notification to Discord
   * @param eventType The type of game event
   * @param title The title of the notification
   * @param description The description/content of the notification
   * @param details Additional details about the event
   * @returns A promise that resolves when the notification is sent
   */
  public async sendGameEventNotification(
    eventType: string,
    title: string,
    description: string,
    details: Record<string, any>
  ): Promise<void> {
    const fields = Object.entries(details).map(([key, value]) => ({
      name: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      inline: true
    }));

    // Choose color based on event type
    let color = 3447003; // Default blue
    if (eventType.includes('attack')) {
      color = 15158332; // Red for attacks
    } else if (eventType.includes('resource')) {
      color = 5763719; // Green for resources
    } else if (eventType.includes('build')) {
      color = 10181046; // Purple for building
    }

    const embed: DiscordEmbed = {
      title: `${eventType}: ${title}`,
      description,
      color,
      timestamp: new Date().toISOString(),
      fields
    };

    return this.sendNotification({
      embeds: [embed]
    });
  }
}

/**
 * Creates a new Discord notification service
 * @param webhookUrl The Discord webhook URL to send notifications to
 * @returns A new Discord notification service instance
 */
export function createDiscordNotificationService(webhookUrl: string): DiscordNotificationService {
  return new DiscordNotificationService(webhookUrl);
}