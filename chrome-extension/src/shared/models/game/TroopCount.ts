import {TroopName} from "@src/shared/models/game/Troop";

export type TroopsCount = {
  [key in TroopName]?: number;
};