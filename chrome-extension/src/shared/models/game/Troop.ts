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
  | "noble";

export type Troop = {
  name: TroopName;
  cost: ResourceCost;
  buildTime: number;
  speed: number;
  lootCapacity: number;
  attack: number;
  defense: Defense;
  populationCost: number;
};
