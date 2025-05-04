import { EventPayload } from '../base/EventMessage';

export interface CaptchaDetectedDetails {
  captchaId: string;
  imageData?: string; // Base64 encoded image data
  captchaType?: 'image' | 'text' | 'recaptcha';
  location: {
    url: string;
    elementSelector?: string;
  };
}

export interface CaptchaDetectedEventPayload extends EventPayload {
  eventType: 'captchaDetected';
  details: CaptchaDetectedDetails;
}