import {Troop, TroopName} from "@src/shared/models/game/Troop";

export const Spearman: Troop = {
  name: "spear",
  cost: { wood: 50, clay: 30, iron: 10 },
  buildTime: 160,
  speed: 18,
  lootCapacity: 25,
  attack: 10,
  defense: { infantry: 15, cavalry: 45, archer: 20 },
  populationCost: 1
};

export const Swordsman: Troop = {
  name: "sword",
  cost: { wood: 30, clay: 30, iron: 70 },
  buildTime: 200,
  speed: 22,
  lootCapacity: 15,
  attack: 25,
  defense: { infantry: 50, cavalry: 15, archer: 40 },
  populationCost: 1
};

export const Axeman: Troop = {
  name: "axe",
  cost: { wood: 60, clay: 30, iron: 40 },
  buildTime: 190,
  speed: 18,
  lootCapacity: 10,
  attack: 40,
  defense: { infantry: 10, cavalry: 5, archer: 10 },
  populationCost: 1
};

export const Archer: Troop = {
  name: "archer",
  cost: { wood: 100, clay: 30, iron: 60 },
  buildTime: 220,
  speed: 18,
  lootCapacity: 10,
  attack: 30,
  defense: { infantry: 40, cavalry: 20, archer: 50 },
  populationCost: 1
};

export const Scout: Troop = {
  name: "scout",
  cost: { wood: 50, clay: 50, iron: 20 },
  buildTime: 240,
  speed: 9,
  lootCapacity: 0,
  attack: 0,
  defense: { infantry: 2, cavalry: 1, archer: 2 },
  populationCost: 2
};

export const LightCavalry: Troop = {
  name: "light",
  cost: { wood: 125, clay: 100, iron: 250 },
  buildTime: 320,
  speed: 10,
  lootCapacity: 80,
  attack: 130,
  defense: { infantry: 30, cavalry: 40, archer: 30 },
  populationCost: 4
};

export const MountedArcher: Troop = {
  name: "marcher",
  cost: { wood: 250, clay: 100, iron: 150 },
  buildTime: 350,
  speed: 10,
  lootCapacity: 50,
  attack: 120,
  defense: { infantry: 40, cavalry: 30, archer: 50 },
  populationCost: 5
};

export const HeavyCavalry: Troop = {
  name: "heavy",
  cost: { wood: 200, clay: 150, iron: 600 },
  buildTime: 480,
  speed: 11,
  lootCapacity: 50,
  attack: 150,
  defense: { infantry: 200, cavalry: 80, archer: 180 },
  populationCost: 6
};

export const Ram: Troop = {
  name: "ram",
  cost: { wood: 300, clay: 200, iron: 200 },
  buildTime: 600,
  speed: 30,
  lootCapacity: 0,
  attack: 2,
  defense: { infantry: 20, cavalry: 50, archer: 20 },
  populationCost: 5
};

export const Catapult: Troop = {
  name: "catapult",
  cost: { wood: 320, clay: 400, iron: 100 },
  buildTime: 720,
  speed: 30,
  lootCapacity: 0,
  attack: 100,
  defense: { infantry: 100, cavalry: 50, archer: 100 },
  populationCost: 8
};

export const Paladin: Troop = {
  name: "knight",
  cost: { wood: 100, clay: 50, iron: 200 },
  buildTime: 600,
  speed: 10,
  lootCapacity: 100,
  attack: 150,
  defense: { infantry: 250, cavalry: 150, archer: 250 },
  populationCost: 10
};

export const Nobleman: Troop = {
  name: "noble",
  cost: { wood: 40000, clay: 50000, iron: 50000 },
  buildTime: 1800, // in seconds
  speed: 35,       // minutes per field
  lootCapacity: 0,
  attack: 30,
  defense: { infantry: 100, cavalry: 50, archer: 100 },
  populationCost: 100
};

export const AllTroops: Troop[] = [
  Spearman,
  Swordsman,
  Axeman,
  Archer,
  Scout,
  LightCavalry,
  MountedArcher,
  HeavyCavalry,
  Ram,
  Catapult,
  Paladin,
  Nobleman
];

export const AllTroopsByName: Record<TroopName, Troop> = AllTroops.reduce((acc, troop) => {
  acc[troop.name] = troop;
  return acc;
}, {} as Record<TroopName, Troop>);


export const AllTroopNames = AllTroops.map(t => t.name);
