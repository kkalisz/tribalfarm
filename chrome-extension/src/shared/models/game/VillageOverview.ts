import { Coordinates } from '@src/shared/models/actions';

export interface VillageOverview {
  villageId: string;
  name: string;
  coordinates: Coordinates;
  points: number;
  resources: {
    wood: number;
    stone: number;
    iron: number;
  };
  storage: number;
  farm: {
    used: number;
    max: number;
  };
}