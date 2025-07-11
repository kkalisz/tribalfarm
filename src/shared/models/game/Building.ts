import {ResourceCostFactors} from "@src/shared/models/game/ResourceCostFactors";
import {ResourceCost} from "@src/shared/models/game/ResourceCost";

export type BuildingName =
  | "main" // Headquarters
  | "barracks"
  | "stable"
  | "garage" // Workshop
  | "church"
  | "church_f" // First church
  | "watchtower"
  | "snob" // Academy
  | "smith" // Smithy
  | "place" // Rally point
  | "statue"
  | "market"
  | "wood" // Timber camp
  | "stone" // Clay pit
  | "iron" // Iron mine
  | "farm"
  | "storage" // Warehouse
  | "hide" // Hiding place
  | "wall";


export type Building = {
  name: BuildingName; // Name of the building
  maxLevel: number; // Maximum level of the building
  minLevel: number; // Minimum level of the building
  baseCost: ResourceCost; // Base cost in terms of wood, stone, iron, and population
  costFactors: ResourceCostFactors; // Cost increase factors per level
  buildTime: number; // Construction or upgrade time for the initial level
  buildTimeFactor: number; // Build time increase factor per level
};