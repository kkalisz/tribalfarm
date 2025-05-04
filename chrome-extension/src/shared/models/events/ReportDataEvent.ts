import { EventPayload } from '../base/EventMessage';
import { ReportType } from '../actions/ReadReportAction';
import { Coordinates } from '../actions/SendAttackAction';
import { ResourceCost } from './BuildResponseEvent';

export interface CombatResult {
  attacker: {
    troops: Record<string, { sent: number; survived: number; }>;
    losses: number;
  };
  defender: {
    troops: Record<string, { initial: number; survived: number; }>;
    losses: number;
  };
  buildings?: Record<string, number>; // Building damage
  wall?: { before: number; after: number; };
  morale?: number;
  luck?: number;
}

export interface ReportDataDetails {
  reportId: string;
  type: ReportType;
  title: string;
  date: string; // ISO date string
  source?: Coordinates;
  sourceVillageName?: string;
  sourcePlayerName?: string;
  target?: Coordinates;
  targetVillageName?: string;
  targetPlayerName?: string;
  read: boolean;
  content: string;
  combatResult?: CombatResult;
  resourcesPlundered?: ResourceCost;
  haul?: ResourceCost;
  error?: {
    message: string;
    code?: string;
  };
}

export interface ReportDataEventPayload extends EventPayload {
  eventType: 'reportData';
  details: ReportDataDetails;
}