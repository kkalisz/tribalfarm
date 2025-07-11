import {BaseVillageInfo} from "@src/shared/models/game/BaseVillageInfo";


export default function findVillageById(villages?: BaseVillageInfo[], villageId?: string) {
  return villages?.find(village => village.villageId === villageId);
}