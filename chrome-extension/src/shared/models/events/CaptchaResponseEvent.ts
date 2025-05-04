import { EventPayload } from '../base/EventMessage';

export interface CaptchaResponseDetails {
  captchaId: string;
  success: boolean;
  error?: {
    message: string;
    code?: string;
  };
  retryCount?: number;
  maxRetries?: number;
}

export interface CaptchaResponseEventPayload extends EventPayload {
  eventType: 'captchaResponse';
  details: CaptchaResponseDetails;
}