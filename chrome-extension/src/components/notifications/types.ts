export enum NotificationType {
  BASIC = 'basic',
  IMAGE = 'image',
  LIST = 'list',
  PROGRESS = 'progress'
}

export interface NotificationButton {
  title: string;
  iconUrl?: string;
}

export interface NotificationItem {
  title: string;
  message: string;
}

export interface NotificationOptions {
  title: string;
  message: string;
  type?: NotificationType;
  iconUrl: string;
  imageUrl?: string;
  buttons?: NotificationButton[];
  items?: NotificationItem[];
  progress?: number;
  priority?: number;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationClickEvent {
  notificationId: string;
  buttonIndex?: number;
}

export interface NotificationClosedEvent {
  notificationId: string;
  byUser: boolean;
}