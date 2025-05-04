import { CommandPayload } from '../base/CommandMessage';

export enum ReportType {
  ATTACK = 'attack',
  DEFENSE = 'defense',
  SUPPORT = 'support',
  TRADE = 'trade',
  OTHER = 'other'
}

export interface ReportFilter {
  type?: ReportType;
  read?: boolean;
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
  limit?: number;
}

export interface ReadReportActionParameters {
  reportId?: string;  // If provided, read specific report
  filter?: ReportFilter; // If reportId not provided, use filter to find reports
  markAsRead?: boolean;
}

export interface ReadReportActionPayload extends CommandPayload {
  action: 'readReport';
  parameters: ReadReportActionParameters;
}