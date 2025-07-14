import {AllTroopNames, TroopName} from "@src/shared/models/game/Troop";

export type TroopsCount = {
  [key in TroopName]?: number;
};


export function addTroops(troops1: TroopsCount, troops2: TroopsCount): TroopsCount {
  const result: TroopsCount = {};

  // Use AllTroopNames to iterate over all defined troop names
  for (const troop of AllTroopNames) {
    const count1 = troops1[troop] ?? 0; // Assume 0 if key doesn't exist
    const count2 = troops2[troop] ?? 0; // Assume 0 if key doesn't exist
    result[troop] = count1 + count2;    // Add counts
  }

  return result;
}

export function subtractTroops(troops1: TroopsCount, troops2: TroopsCount): TroopsCount {
  const result: TroopsCount = {};

  // Use AllTroopNames to iterate over all defined troop names
  for (const troop of AllTroopNames) {
    const count1 = troops1[troop] ?? 0; // Assume 0 if key doesn't exist
    const count2 = troops2[troop] ?? 0; // Assume 0 if key doesn't exist
    result[troop] = count1 - count2;    // Subtract counts
  }

  return result;
}

export function getMinTroops(troops1: TroopsCount, troops2: TroopsCount): TroopsCount {
  const result: TroopsCount = {};

  // Iterate over all defined troop names in AllTroopNames
  for (const troop of AllTroopNames) {
    const count1 = troops1[troop]; // Access value in troops1 (can be undefined)
    const count2 = troops2[troop]; // Access value in troops2 (can be undefined)

    // Logic to take the minimum defined value or defined value if the other is undefined
    if (count1 === undefined) {
      result[troop] = count2;
    } else if (count2 === undefined) {
      result[troop] = count1;
    } else {
      result[troop] = Math.min(count1, count2);
    }
  }

  return result;
}

export function countTroops(troops: TroopsCount): number {
  return AllTroopNames.reduce((count, troop) => count + (troops[troop] ?? 0), 0);
}
