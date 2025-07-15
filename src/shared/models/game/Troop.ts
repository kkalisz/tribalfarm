import {ResourceCost} from "@src/shared/models/game/ResourceCost";
import {Defense} from "@src/shared/models/game/Defence";
import {TroopsCount} from '@src/shared/models/game/TroopCount';

export type TroopName =
  | "spear"
  | "sword"
  | "axe"
  | "archer"
  | "scout"
  | "light"
  | "marcher"
  | "heavy"
  | "ram"
  | "catapult"
  | "knight"
  | "noble"
  | "militia";

export type Troop = {
  name: TroopName; // The mapped troop name as per your old TroopName type
  aliasName: string; // The original name from the XML
  cost: ResourceCost; // Resource cost, includes "pop" for population
  buildTime: number; // Time required to train the troop (in seconds)
  speed: number; // Speed of the troop
  attack: number; // Attack power
  defense: Defense; // Defense stats against different troop types
  lootCapacity: number; // Carrying capacity during looting
};


export const troopNameMapping: Record<string, TroopName> = {
  spear: 'spear',
  sword: 'sword',
  axe: 'axe',
  archer: 'archer',
  spy: 'scout',
  light: 'light',
  marcher: 'marcher',
  heavy: 'heavy',
  ram: 'ram',
  catapult: 'catapult',
  knight: 'knight',
  snob: 'noble',
  militia: 'militia',
};

export const troopStaticCosts: Record<TroopName, ResourceCost> = {
  spear: { wood: 50, stone: 30, iron: 10, pop: 1 },
  sword: { wood: 30, stone: 30, iron: 70, pop: 1 },
  axe: { wood: 60, stone: 30, iron: 40, pop: 1 },
  archer: { wood: 100, stone: 30, iron: 60, pop: 1 },
  scout: { wood: 50, stone: 50, iron: 20, pop: 2 },
  light: { wood: 125, stone: 100, iron: 250, pop: 4 },
  marcher: { wood: 250, stone: 100, iron: 150, pop: 5 },
  heavy: { wood: 200, stone: 150, iron: 600, pop: 6 },
  ram: { wood: 300, stone: 200, iron: 200, pop: 5 },
  catapult: { wood: 320, stone: 400, iron: 100, pop: 8 },
  knight: { wood: 20, stone: 20, iron: 40, pop: 10 },
  noble: { wood: 28000, stone: 30000, iron: 25000, pop: 100 },
  militia: { wood: 0, stone: 0, iron: 0, pop: 0 }, // Default cost for militia
};

export const AllTroopNames: TroopName[] = Object.keys(troopStaticCosts).map((key) => key as TroopName);

export const AllZeroTroops: TroopsCount = AllTroopNames.reduce((acc, name) => {
  acc[name] = 0;
  return acc;
}, {} as TroopsCount);