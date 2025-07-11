import {AllTroopNames, TroopName} from "@src/shared/models/game/Troop";

export type TroopsCount = {
  [key in TroopName]?: number;
};


export function addTroops(troops1: TroopsCount, troops2: TroopsCount): TroopsCount {
  const result: TroopsCount = {};

  // Use AllTroopNames to iterate over all defined troop names
  for (const troop of AllTroopNames) {
    const count1 = troops1[troop] || 0; // Assume 0 if key doesn't exist
    const count2 = troops2[troop] || 0; // Assume 0 if key doesn't exist
    result[troop] = count1 + count2;    // Add counts
  }

  return result;
}

export function subtractTroops(troops1: TroopsCount, troops2: TroopsCount): TroopsCount {
  const result: TroopsCount = {};

  // Use AllTroopNames to iterate over all defined troop names
  for (const troop of AllTroopNames) {
    const count1 = troops1[troop] || 0; // Assume 0 if key doesn't exist
    const count2 = troops2[troop] || 0; // Assume 0 if key doesn't exist
    result[troop] = count1 - count2;    // Subtract counts
  }

  return result;
}

export function countTroops(troops: TroopsCount): number {
  return AllTroopNames.reduce((count, troop) => count + (troops[troop] || 0), 0);
}
