import {WorldConfig} from "@src/shared/models/game/WorldConfig";
import {Troop} from "@src/shared/models/game/Troop";
import {Building} from "@src/shared/models/game/Building";

export interface ServerConfig {
  worldConfig: WorldConfig;
  troopsConfig: Troop[];
  buildingConfig: Building[]
}