import {IDBPDatabase, IDBPObjectStore} from 'idb';
import { PlayerSettings } from '@src/shared/hooks/usePlayerSettings';
import { WorldConfig } from '@src/shared/models/game/WorldConfig';
import { v4 as uuidv4 } from 'uuid';
import {TroopsCount} from "@src/shared/models/game/TroopCount";
import {DatabaseSchema} from "@src/shared/db/GameDataBase";
import {Troop} from "@src/shared/models/game/Troop";
import {Building} from "@src/shared/models/game/Building";
import {BaseVillageInfo} from "@src/shared/models/game/BaseVillageInfo";
import {ScavengeSettings} from "@src/shared/models/game/ScavengeSettings";
import {Log, LogFilterParams, LogPaginationParams, LogSeverity} from "@src/shared/models/game/Log";

export class GameDataBaseAccess {

  constructor(private readonly db: IDBPDatabase<DatabaseSchema>) {
  }

  /* ---------- TroopsCount Methods ---------- */

  // Upsert (insert or update) a TroopsCount entry
  public async upsertTroopsCount(id: string | undefined, troopsCount: TroopsCount): Promise<string> {
    const troopsId = id ?? uuidv4();
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

  /* ---------- VillageOverview Methods ---------- */

  // Save a VillageOverview
  public async saveVillageOverview(village: BaseVillageInfo): Promise<void> {
    await this.db.put('villageOverviews', village);
  }

  // Save multiple VillageOverviews
  public async saveVillageOverviews(villages: BaseVillageInfo[]): Promise<void> {
    await Promise.all(villages.map(village => this.saveVillageOverview(village)));
  }

  accountDb = {

    // VillageOverview methods
    saveVillageOverview: async (village: BaseVillageInfo): Promise<void> => {
      await this.db.put('villageOverviews', village);
    },

    saveVillageOverviews: async (villages: BaseVillageInfo[]): Promise<void> => {
      await this.accountDb.deleteAllVillageOverviews();
      await Promise.all(villages.map(village => this.db.put('villageOverviews', village)));
    },

    // Get a VillageOverview by ID
    getVillageOverview: async (villageId: string): Promise<BaseVillageInfo | undefined> => {
      return await this.db.get('villageOverviews', villageId);
    },

    // Get all VillageOverviews
    getAllVillageOverviews: async (): Promise<BaseVillageInfo[]> => {
      return await this.db.getAll('villageOverviews');
    },

    // Delete a VillageOverview by ID
    deleteVillageOverview: async (villageId: string): Promise<void> => {
      await this.db.delete('villageOverviews', villageId);
    },

    // Delete all VillageOverviews
    deleteAllVillageOverviews: async (): Promise<void> => {
      const allVillages = await this.accountDb.getAllVillageOverviews();
      await Promise.all(allVillages.map(village => this.accountDb.deleteVillageOverview(village.villageId)));
    },
  };

  scavengeDb = {
    // Save scavenge settings for a village
    saveScavengeSettings: async (settings: ScavengeSettings): Promise<void> => {
      await this.db.put('scavengeSettings', settings);
    },

    // Get scavenge settings for a village
    getScavengeSettings: async (villageId: string): Promise<ScavengeSettings | undefined> => {
      return await this.db.get('scavengeSettings', villageId);
    },

    // Delete scavenge settings for a village
    deleteScavengeSettings: async (villageId: string): Promise<void> => {
      await this.db.delete('scavengeSettings', villageId);
    },

    // Get all scavenge settings
    getAllScavengeSettings: async (): Promise<ScavengeSettings[]> => {
      return await this.db.getAll('scavengeSettings');
    },

    // Delete all scavenge settings
    deleteAllScavengeSettings: async (): Promise<void> => {
      const allSettings = await this.scavengeDb.getAllScavengeSettings();
      await Promise.all(allSettings.map(settings => this.scavengeDb.deleteScavengeSettings(settings.villageId)));
    }
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

    //
    saveTroopsConfig: async (config: Troop[]): Promise<void> => {
      Promise.all(config.map(async (troop) => {
        await this.db.put('troopConfig', {
          id: troop.name,
          name: troop.name,
          config: troop,
        });
      }))
    },

    getTroopConfigs: async (): Promise<Troop[]> => {
      const record = await this.db.getAll('troopConfig');
      return record ?? [];
    },

    //
    saveBuildingConfig: async (config: Building[]): Promise<void> => {
      Promise.all(config.map(async (troop) => {
        await this.db.put('buildingConfig', {
          id: troop.name,
          name: troop.name,
          config: troop,
        });
      }))
    },

    getBuildingConfigs: async (): Promise<Building[]> => {
      const record = await this.db.getAll('buildingConfig');
      return record ?? [];
    },
  };

  logsDb = {
    /**
     * Save a single log entry
     * @param log The log entry to save (id will be generated if not provided)
     * @returns The ID of the saved log
     */
    saveLog: async (log: Omit<Log, 'id'> & { id?: string }): Promise<string> => {
      const logId = log.id ?? uuidv4();
      const timestamp = log.timestamp ?? Date.now();
      
      await this.db.put('logs', {
        ...log,
        id: logId,
        timestamp
      });
      
      return logId;
    },

    /**
     * Save multiple log entries
     * @param logs Array of log entries to save
     * @returns Array of IDs of the saved logs
     */
    saveLogs: async (logs: (Omit<Log, 'id'> & { id?: string })[]): Promise<string[]> => {
      const logIds: string[] = [];
      
      for (const log of logs) {
        const logId = await this.logsDb.saveLog(log);
        logIds.push(logId);
      }
      
      return logIds;
    },

    /**
     * Get a log entry by ID
     * @param id The ID of the log to retrieve
     * @returns The log entry or undefined if not found
     */
    getLog: async (id: string): Promise<Log | undefined> => {
      return await this.db.get('logs', id);
    },

    /**
     * Get logs with pagination and optional filtering
     * @param pagination Pagination parameters
     * @param filter Optional filter parameters
     * @returns Object containing logs array and pagination info
     */
    getLogs: async (
      pagination: LogPaginationParams,
      filter?: LogFilterParams
    ): Promise<{ logs: Log[]; hasMore: boolean; nextCursor?: string }> => {
      const { limit = 50, cursor, direction = 'desc' } = pagination;
      const logs: Log[] = [];
      let hasMore = false;
      let nextCursor: string | undefined;
      
      // Map 'asc'/'desc' to valid IDBCursorDirection values
      const cursorDirection: IDBCursorDirection = direction === 'asc' ? 'next' : 'prev';
      
      // Determine which index to use based on filter
      let index: ReturnType<IDBPObjectStore<DatabaseSchema, any, 'logs', 'readonly'>['index']> | null = null;
      let range: IDBKeyRange | null = null;
      
      if (filter?.severity) {
        index = this.db.transaction('logs', 'readonly').objectStore('logs').index('by-severity');
        range = IDBKeyRange.only(filter.severity);
      } else if (filter?.type) {
        index = this.db.transaction('logs', 'readonly').objectStore('logs').index('by-type');
        range = IDBKeyRange.only(filter.type);
      } else if (filter?.sourceVillage) {
        index = this.db.transaction('logs', 'readonly').objectStore('logs').index('by-village');
        range = IDBKeyRange.only(filter.sourceVillage);
      } else if (filter?.startTimestamp && filter?.endTimestamp) {
        index = this.db.transaction('logs', 'readonly').objectStore('logs').index('by-timestamp');
        range = IDBKeyRange.bound(filter.startTimestamp, filter.endTimestamp);
      } else if (filter?.startTimestamp) {
        index = this.db.transaction('logs', 'readonly').objectStore('logs').index('by-timestamp');
        range = IDBKeyRange.lowerBound(filter.startTimestamp);
      } else if (filter?.endTimestamp) {
        index = this.db.transaction('logs', 'readonly').objectStore('logs').index('by-timestamp');
        range = IDBKeyRange.upperBound(filter.endTimestamp);
      } else {
        // Default to timestamp index for chronological ordering
        index = this.db.transaction('logs', 'readonly').objectStore('logs').index('by-timestamp');
      }
      
      // Get cursor for pagination
      let cursorPosition: Awaited<ReturnType<typeof index.openCursor>> = null;
      
      if (cursor) {
        const cursorLog = await this.logsDb.getLog(cursor);
        if (cursorLog) {
          if (index) {
            // Position cursor based on the index being used
            if (index.name === 'by-severity') {
              cursorPosition = await index.openCursor(IDBKeyRange.only(cursorLog.severity), cursorDirection);
            } else if (index.name === 'by-type') {
              cursorPosition = await index.openCursor(IDBKeyRange.only(cursorLog.type), cursorDirection);
            } else if (index.name === 'by-village') {
              cursorPosition = await index.openCursor(IDBKeyRange.only(cursorLog.sourceVillage), cursorDirection);
            } else if (index.name === 'by-timestamp') {
              cursorPosition = await index.openCursor(IDBKeyRange.only(cursorLog.timestamp), cursorDirection);
            }
            
            // Advance to the cursor position
            while (cursorPosition && cursorPosition.value.id !== cursor) {
              await cursorPosition.continue();
            }
            
            // Move to the next item after the cursor
            if (cursorPosition) {
              await cursorPosition.continue();
            }
          }
        }
      } else {
        // Start from the beginning or end based on direction
        cursorPosition = await index?.openCursor(range, cursorDirection);
      }
      
      // Collect logs
      let count = 0;
      while (cursorPosition && count < limit) {
        // Apply additional filters that couldn't be applied via indexes
        let includeLog = true;
        
        if (filter?.severity && cursorPosition.value.severity !== filter.severity) {
          includeLog = false;
        }
        
        if (filter?.type && cursorPosition.value.type !== filter.type) {
          includeLog = false;
        }
        
        if (filter?.sourceVillage && cursorPosition.value.sourceVillage !== filter.sourceVillage) {
          includeLog = false;
        }
        
        if (filter?.startTimestamp && cursorPosition.value.timestamp < filter.startTimestamp) {
          includeLog = false;
        }
        
        if (filter?.endTimestamp && cursorPosition.value.timestamp > filter.endTimestamp) {
          includeLog = false;
        }
        
        if (includeLog) {
          logs.push(cursorPosition.value);
          count++;
        }
        
        await cursorPosition.continue();
      }
      
      // Check if there are more logs
      hasMore = cursorPosition !== null;
      
      // Set the next cursor if there are more logs
      if (hasMore && logs.length > 0) {
        nextCursor = logs[logs.length - 1].id;
      }
      
      return { logs, hasMore, nextCursor };
    },

    /**
     * Delete a log entry by ID
     * @param id The ID of the log to delete
     */
    deleteLog: async (id: string): Promise<void> => {
      await this.db.delete('logs', id);
    },

    /**
     * Delete all logs
     */
    deleteAllLogs: async (): Promise<void> => {
      await this.db.clear('logs');
    },

    /**
     * Delete logs by filter criteria
     * @param filter Filter parameters
     * @returns Number of logs deleted
     */
    deleteLogsByFilter: async (filter: LogFilterParams): Promise<number> => {
      let count = 0;
      const tx = this.db.transaction('logs', 'readwrite');
      const store = tx.objectStore('logs');
      
      // Determine which index to use based on filter
      let index: ReturnType<IDBPObjectStore<DatabaseSchema, any, 'logs', 'readwrite'>['index']> | null = null;
      let range: IDBKeyRange | null = null;
      
      if (filter.severity) {
        index = store.index('by-severity');
        range = IDBKeyRange.only(filter.severity);
      } else if (filter.type) {
        index = store.index('by-type');
        range = IDBKeyRange.only(filter.type);
      } else if (filter.sourceVillage) {
        index = store.index('by-village');
        range = IDBKeyRange.only(filter.sourceVillage);
      } else if (filter.startTimestamp && filter.endTimestamp) {
        index = store.index('by-timestamp');
        range = IDBKeyRange.bound(filter.startTimestamp, filter.endTimestamp);
      } else if (filter.startTimestamp) {
        index = store.index('by-timestamp');
        range = IDBKeyRange.lowerBound(filter.startTimestamp);
      } else if (filter.endTimestamp) {
        index = store.index('by-timestamp');
        range = IDBKeyRange.upperBound(filter.endTimestamp);
      } else {
        // No specific filter, use the main store
        index = null;
      }
      
      // Define a type that works for both store and index cursors
      let cursor: Awaited<ReturnType<typeof store.openCursor>> | Awaited<ReturnType<NonNullable<typeof index>['openCursor']>> | null;
      
      if (index && range) {
        cursor = await index.openCursor(range);
      } else if (index) {
        cursor = await index.openCursor();
      } else {
        cursor = await store.openCursor();
      }
      
      while (cursor) {
        // Apply additional filters that couldn't be applied via indexes
        let deleteLog = true;
        
        if (filter.severity && cursor.value.severity !== filter.severity) {
          deleteLog = false;
        }
        
        if (filter.type && cursor.value.type !== filter.type) {
          deleteLog = false;
        }
        
        if (filter.sourceVillage && cursor.value.sourceVillage !== filter.sourceVillage) {
          deleteLog = false;
        }
        
        if (filter.startTimestamp && cursor.value.timestamp < filter.startTimestamp) {
          deleteLog = false;
        }
        
        if (filter.endTimestamp && cursor.value.timestamp > filter.endTimestamp) {
          deleteLog = false;
        }
        
        if (deleteLog) {
          await cursor.delete();
          count++;
        }
        
        await cursor.continue();
      }
      
      await tx.done;
      return count;
    }
  };
}
