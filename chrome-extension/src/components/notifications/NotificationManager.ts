import { NotificationType, NotificationOptions } from './types';

class NotificationManager {
  private static instance: NotificationManager;
  private readonly defaultOptions: Partial<chrome.notifications.NotificationOptions> = {
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    priority: 1
  };

  private constructor() {}

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  public async showNotification(options: NotificationOptions): Promise<string> {
    const notificationId = `tribal-farm-${Date.now()}`;
    
    const notificationOptions: chrome.notifications.NotificationOptions<true> = {
      ...this.defaultOptions,
      title: options.title,
      message: options.message,
      type: options.type || 'basic',
      ...(options.buttons && { buttons: options.buttons }),
      ...(options.items && { items: options.items }),
      ...(options.progress && { progress: options.progress }),
      iconUrl: options.iconUrl
    };

    return new Promise((resolve, reject) => {
      chrome.notifications.create(notificationId, notificationOptions, (notificationId) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(notificationId);
        }
      });
    });
  }

  public async showSuccess(title: string, message: string): Promise<string> {
    return this.showNotification({
      type: NotificationType.BASIC,
      title,
      message,
      iconUrl: 'icons/success.png'
    });
  }

  public async showError(title: string, message: string): Promise<string> {
    return this.showNotification({
      type: NotificationType.BASIC,
      title,
      message,
      iconUrl: 'icons/error.png'
    });
  }

  public async showProgress(title: string, message: string, progress: number): Promise<string> {
    return this.showNotification({
      type: NotificationType.PROGRESS,
      title,
      message,
      progress,
      iconUrl: 'icons/error.png'
    });
  }

  public async clearNotification(notificationId: string): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.notifications.clear(notificationId, (wasCleared) => {
        resolve(wasCleared);
      });
    });
  }

  public async clearAllNotifications(): Promise<void> {
    return new Promise((resolve) => {
      chrome.notifications.getAll((notifications) => {
        const clearPromises = Object.keys(notifications).map(id => this.clearNotification(id));
        Promise.all(clearPromises).then(() => resolve());
      });
    });
  }
}

export const notificationManager = NotificationManager.getInstance();