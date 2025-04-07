import { NotificationClickEvent, NotificationClosedEvent } from '../components/notifications/types';

class NotificationHandler {
  private static instance: NotificationHandler;
  private clickListeners: Map<string, (event: NotificationClickEvent) => void>;
  private closeListeners: Map<string, (event: NotificationClosedEvent) => void>;

  private constructor() {
    this.clickListeners = new Map();
    this.closeListeners = new Map();
    this.setupEventListeners();
  }

  public static getInstance(): NotificationHandler {
    if (!NotificationHandler.instance) {
      NotificationHandler.instance = new NotificationHandler();
    }
    return NotificationHandler.instance;
  }

  private setupEventListeners(): void {
    // Handle notification clicks
    chrome.notifications.onClicked.addListener((notificationId) => {
      const listener = this.clickListeners.get(notificationId);
      if (listener) {
        listener({ notificationId });
        this.clickListeners.delete(notificationId);
      }
    });

    // Handle button clicks in notifications
    chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
      const listener = this.clickListeners.get(notificationId);
      if (listener) {
        listener({ notificationId, buttonIndex });
        this.clickListeners.delete(notificationId);
      }
    });

    // Handle notification closed
    chrome.notifications.onClosed.addListener((notificationId, byUser) => {
      const listener = this.closeListeners.get(notificationId);
      if (listener) {
        listener({ notificationId, byUser });
        this.closeListeners.delete(notificationId);
      }
    });
  }

  public onNotificationClick(notificationId: string, callback: (event: NotificationClickEvent) => void): void {
    this.clickListeners.set(notificationId, callback);
  }

  public onNotificationClosed(notificationId: string, callback: (event: NotificationClosedEvent) => void): void {
    this.closeListeners.set(notificationId, callback);
  }

  public removeClickListener(notificationId: string): void {
    this.clickListeners.delete(notificationId);
  }

  public removeCloseListener(notificationId: string): void {
    this.closeListeners.delete(notificationId);
  }
}

export const notificationHandler = NotificationHandler.getInstance();