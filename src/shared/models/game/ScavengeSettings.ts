import { ScavengeCalculationMode } from "@src/shared/actions/backend/scavenge/calculateScavenge";
import { TroopsCount } from "@src/shared/models/game/TroopCount";

export interface ScavengeSettings {
  villageId: string; // Primary key, matches BaseVillageInfo.villageId
  enabled: boolean; // Whether scavenge is enabled for this village
  calculationMode: ScavengeCalculationMode; // The mode to use for scavenge calculations
  troopsLimit: TroopsCount; // Maximum troops to be used for scavenging
  troopsExcluded: TroopsCount; // Troops that can't be used for scavenging
}