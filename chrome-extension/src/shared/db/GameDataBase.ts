import { IDBPDatabase, openDB } from 'idb';
import { PlayerSettings } from '@src/shared/hooks/usePlayerSettings';
import { WorldConfig } from '@src/shared/models/game/WorldConfig';
import {TroopsCount} from "@src/shared/models/game/TroopCount";
import {Troop} from "@src/shared/models/game/Troop";
import {Building} from "@src/shared/models/game/Building"; // For generating unique identifiers
import {VillageOverview} from "@src/shared/models/game/BaseVillageInfo";

// Define the database schema using TypeScript interfaces
export interface DatabaseSchema {
  troopsCounts: {
    key: string; // Primary key
    value: {
      id: string; // Unique identifier for TroopsCount
      troops: TroopsCount; // TroopsCount object
    };
  };
  playerSettings: {
    key: string; // Primary key
    value: {
      id: string; // Identifier derived from domain prefix
      settings: PlayerSettings; // Player settings object
    };
  };
  worldConfig: {
    key: string; // Primary key
    value: {
      id: string; // Identifier derived from domain prefix
      config: WorldConfig; // World configuration object
    };
  };
  troopConfig: {
    key: string; // Primary key
    value: Troop;
  };
  buildingConfig: {
    key: string; // Primary key
    value: Building;
  };
  villageOverviews: {
    key: string; // Primary key (villageId)
    value: VillageOverview;
  };
}

export class GameDataBase {
  db!: IDBPDatabase<DatabaseSchema>;
  prefix: string;

  constructor(fullDomainUrl: string) {
    // Use the fullDomainUrl as a prefix to scope data for each instance
    this.prefix = fullDomainUrl.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize and use as prefix
  }

  // Initialize the database (singleton behavior per instance)
  public async init(): Promise<void> {
    this.db = await openDB<DatabaseSchema>(`${this.prefix}_database`, 2, {
      upgrade(db) {
        // Create the "troopsCounts" store
        if (!db.objectStoreNames.contains('troopsCounts')) {
          db.createObjectStore('troopsCounts', {
            keyPath: 'id',
          });
        }

        // Create the "playerSettings" store
        if (!db.objectStoreNames.contains('playerSettings')) {
          db.createObjectStore('playerSettings', {
            keyPath: 'id',
          });
        }

        // Create the "worldConfig" store
        if (!db.objectStoreNames.contains('worldConfig')) {
          db.createObjectStore('worldConfig', {
            keyPath: 'id',
          });
        }

        // Create the "troopConfig" store, using the `name` field from Troop as the key
        if (!db.objectStoreNames.contains('troopConfig')) {
          db.createObjectStore('troopConfig', {
            keyPath: 'name', // Use `name` as the key
          });
        }

        if (!db.objectStoreNames.contains('buildingConfig')) {
          db.createObjectStore('buildingConfig', {
            keyPath: 'name', // Use `name` as the key
          });
        }

        // Create the "villageOverviews" store
        if (!db.objectStoreNames.contains('villageOverviews')) {
          db.createObjectStore('villageOverviews', {
            keyPath: 'villageId', // Use `villageId` as the key
          });
        }
      },
    });
  }
}
