import {TroopName} from "@src/shared/models/game/Troop";
import {calculateScavengeImpl} from "@src/shared/actions/backend/scavenge/calculateScavengeImpl";
import {TroopsCount} from "@src/shared/models/game/TroopCount";

export type TroopsWithCount = Record<TroopName, number>;

export enum ScavengeCalculationMode {
  MAX_RESOURCES_PER_RUN,
  SAME_RETURN_TIME,
  MAX_RESOURCES_PER_HOUR,
}

export interface ScavengeMissionPlan {
  missionIndex: number;
  totalCapacity: number;
  resources: number;
  runTime: number;
  unitsAllocated: TroopsCount; // For each unit, how many were allocated in this mission
}

export interface ScavengeMissionsPlan {
  missions: ScavengeMissionPlan[]; // Detailed results of all missions
  totalResPerRun: number; // Total resources collected per run
  totalResPerHour: number; // Total resources collected per hour
  totalRunTime: number; // Total maximum runtime (longest mission runtime)
}

export interface ScavengeMissionInfo {
  id: string,
  canBenUsed: boolean,
  isAvailable: boolean,
  isUnlocked: boolean,
  finishTime: string,
}

export function calculateScavenge(
  allUnitsElements: TroopsCount, // Information about all units
  worldSpeed: number, // World speed factor
  missionsInfo: ScavengeMissionInfo[], // Enabled missions
  calcMethod: ScavengeCalculationMode, // Calculation method (e.g., max or default)
  timeLimitInMinutes: number = Infinity // Time limit in minutes (0 means no limit)
): ScavengeMissionsPlan {
  return calculateScavengeImpl(allUnitsElements,worldSpeed,missionsInfo, calcMethod, timeLimitInMinutes )
}