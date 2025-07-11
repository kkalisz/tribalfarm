import {Coordinates} from "@src/shared/models/game/Coordinates";

export interface BaseVillageInfo {
  villageId: string;
  name: string;
  coordinates: Coordinates;
}