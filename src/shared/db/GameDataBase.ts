import { IDBPDatabase, openDB } from 'idb';
import { PlayerSettings } from '@src/shared/hooks/usePlayerSettings';
import { WorldConfig } from '@src/shared/models/game/WorldConfig';
import {TroopsCount} from "@src/shared/models/game/TroopCount";
import {Troop} from "@src/shared/models/game/Troop";
import {Building} from "@src/shared/models/game/Building"; // For generating unique identifiers
import {BaseVillageInfo} from "@src/shared/models/game/BaseVillageInfo";
import {ScavengeSettings} from "@src/shared/models/game/ScavengeSettings";
import {Log} from "@src/shared/models/game/Log";

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
    value: BaseVillageInfo;
  };
  scavengeSettings: {
    key: string; // Primary key (villageId)
    value: ScavengeSettings;
  };
  logs: {
    key: string; // Primary key (id)
    value: Log; // Log object
    indexes: {
      'by-severity': string; // Index on severity field
      'by-type': string; // Index on type field
      'by-timestamp': number; // Index on timestamp field
      'by-village': number; // Index on sourceVillage field
    };
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
    this.db = await openDB<DatabaseSchema>(`${this.prefix}_database`, 4, {
      upgrade(db, oldVersion, newVersion) {
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

        // Create the "scavengeSettings" store
        if (!db.objectStoreNames.contains('scavengeSettings')) {
          db.createObjectStore('scavengeSettings', {
            keyPath: 'villageId', // Use `villageId` as the key
          });
        }

        // Create the "logs" store with indexes for filtering
        if (!db.objectStoreNames.contains('logs')) {
          const logsStore = db.createObjectStore('logs', {
            keyPath: 'id',
          });
          
          // Create indexes for efficient filtering
          logsStore.createIndex('by-severity', 'severity');
          logsStore.createIndex('by-type', 'type');
          logsStore.createIndex('by-timestamp', 'timestamp');
          
          // Create index for sourceVillage (if it exists)
          logsStore.createIndex('by-village', 'sourceVillage', { multiEntry: false });
        }
      },
    });
  }
}
