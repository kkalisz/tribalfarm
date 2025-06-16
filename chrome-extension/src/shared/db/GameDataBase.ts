import { IDBPDatabase, openDB } from 'idb';
import { PlayerSettings } from '@src/shared/hooks/usePlayerSettings';
import { WorldConfig } from '@src/shared/models/game/WorldConfig';
import { v4 as uuidv4 } from 'uuid';
import {TroopsCount} from "@src/shared/models/game/TroopCount"; // For generating unique identifiers

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
    this.db = await openDB<DatabaseSchema>(`${this.prefix}_database`, 1, {
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
      },
    });
  }

  /* ---------- TroopsCount Methods ---------- */

  // Upsert (insert or update) a TroopsCount entry
  public async upsertTroopsCount(id: string | undefined, troopsCount: TroopsCount): Promise<string> {
    const troopsId = id || uuidv4();
    await this.db.put('troopsCounts', {
      id: troopsId,
      troops: troopsCount,
    });
    return troopsId;
  }

  // Retrieve a TroopsCount by ID
  public async getTroopsCount(id: string): Promise<TroopsCount | null> {
    const record = await this.db.get('troopsCounts', id);
    return record ? record.troops : null;
  }

  // Delete a TroopsCount entry by ID
  public async deleteTroopsCount(id: string): Promise<void> {
    await this.db.delete('troopsCounts', id);
  }

  /* ---------- PlayerSettings Methods ---------- */

  settingDb = {

    savePlayerSettings: async (settings: PlayerSettings): Promise<void> => {
      await this.db.put('playerSettings', {
        id: 'playerSettings',
        settings,
      });
    },

    getPlayerSettings: async (): Promise<PlayerSettings | null> => {
      const record = await this.db.get('playerSettings', 'playerSettings');
      return record ? record.settings : null;
    },

    deletePlayerSettings: async (): Promise<void> => {
      await this.db.delete('playerSettings', 'playerSettings');
    },

    saveWorldConfig: async (config: WorldConfig): Promise<void> => {
      await this.db.put('worldConfig', {
        id: 'worldConfig',
        config,
      });
    },

    getWorldConfig: async (): Promise<WorldConfig | null> => {
      const record = await this.db.get('worldConfig', 'worldConfig');
      return record ? record.config : null;
    },

    deleteWorldConfig: async (): Promise<void> => {
      await this.db.delete('worldConfig', 'worldConfig');
    },
  };
}

// // Example usage
// (async () => {
//   const domainUrl = 'https://example.com';
//   const db = new DB(domainUrl);
//
//   // Initialize the database
//   await db.init();
//
//   // Upsert TroopsCount
//   const troopsCountId = await db.upsertTroopsCount(undefined, { Swordsman: 20, Archer: 10 });
//   console.log('TroopsCount saved with ID:', troopsCountId);
//
//   // Retrieve TroopsCount
//   const retrievedTroopsCount = await db.getTroopsCount(troopsCountId);
//   console.log('Retrieved TroopsCount:', retrievedTroopsCount);
//
//   // Save PlayerSettings
//   const playerSettings: PlayerSettings = {
//     login: 'testUser',
//     password: 'securePassword',
//     world: 'world1',
//     server: 'server1',
//   };
//   await db.savePlayerSettings(playerSettings);
//   console.log('PlayerSettings saved.');
//
//   // Retrieve PlayerSettings
//   const retrievedPlayerSettings = await db.getPlayerSettings();
//   console.log('Retrieved PlayerSettings:', retrievedPlayerSettings);

//   // Save WorldConfig
//   const worldConfig: WorldConfig = {
//     speed: 2.0,
//     troopSpeed: 1.5,
//     unitBuildTimeFactor: 0.8,
//   };
//   await db.saveWorldConfig(worldConfig);
//   console.log('WorldConfig saved.');
//
//   // Retrieve WorldConfig
//   const retrievedWorldConfig = await db.getWorldConfig();
//   console.log('Retrieved WorldConfig:', retrievedWorldConfig);
// })();