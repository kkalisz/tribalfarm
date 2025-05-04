import { CommandPayload } from '../base/CommandMessage';

export interface SolveCaptchaActionParameters {
  solution: string;
  captchaId?: string;
}

export interface SolveCaptchaActionPayload extends CommandPayload {
  action: 'solveCaptcha';
  parameters: SolveCaptchaActionParameters;
}