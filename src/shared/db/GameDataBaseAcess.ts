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
import {Log} from "@src/shared/log/Log";
import {LogFilterParams, LogPaginationParams} from "@src/shared/db/logs";

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
    ): Promise<{ logs: Log[]; hasMore: boolean}> => {
      const { limit = 50, direction = 'desc' } = pagination;
      let allLogs: Log[] = [];
      
      // Use the appropriate index for filtering directly from the database
      if (filter?.severity) {
        allLogs = await this.db.getAllFromIndex('logs', 'by-severity', filter.severity);
      } else if (filter?.type) {
        allLogs = await this.db.getAllFromIndex('logs', 'by-type', filter.type);
      } else if (filter?.sourceVillage) {
        allLogs = await this.db.getAllFromIndex('logs', 'by-village', filter.sourceVillage);
      } else if (filter?.startTimestamp && filter?.endTimestamp) {
        allLogs = await this.db.getAllFromIndex(
          'logs', 
          'by-timestamp', 
          IDBKeyRange.bound(filter.startTimestamp, filter.endTimestamp)
        );
      } else if (filter?.startTimestamp) {
        allLogs = await this.db.getAllFromIndex(
          'logs', 
          'by-timestamp', 
          IDBKeyRange.lowerBound(filter.startTimestamp)
        );
      } else if (filter?.endTimestamp) {
        allLogs = await this.db.getAllFromIndex(
          'logs', 
          'by-timestamp', 
          IDBKeyRange.upperBound(filter.endTimestamp)
        );
      } else {
        // Get all logs if no filter is specified
        console.log("get_all_logs");
        allLogs = await this.db.getAll('logs');
      }
      
      // Apply additional filters that couldn't be applied via indexes
      if (filter) {
        allLogs = allLogs.filter(log => {
          let include = true;
          
          if (filter.severity && log.severity !== filter.severity) {
            include = false;
          }
          
          if (filter.type && log.type !== filter.type) {
            include = false;
          }
          
          if (filter.sourceVillage && log.sourceVillage !== filter.sourceVillage) {
            include = false;
          }
          
          if (filter.startTimestamp && log.timestamp < filter.startTimestamp) {
            include = false;
          }
          
          if (filter.endTimestamp && log.timestamp > filter.endTimestamp) {
            include = false;
          }
          
          return include;
        });
      }
      
      // Sort logs by timestamp
      allLogs.sort((a, b) => {
        return direction === 'asc' 
          ? a.timestamp - b.timestamp 
          : b.timestamp - a.timestamp;
      });
      
      // Apply limit
      const logs = allLogs.slice(0, limit);
      const hasMore = allLogs.length > limit;

      return { logs, hasMore};
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
      let logsToDelete: Log[] = [];
      
      // Get logs that match the filter using the same approach as getLogs
      if (filter.severity) {
        logsToDelete = await this.db.getAllFromIndex('logs', 'by-severity', filter.severity);
      } else if (filter.type) {
        logsToDelete = await this.db.getAllFromIndex('logs', 'by-type', filter.type);
      } else if (filter.sourceVillage) {
        logsToDelete = await this.db.getAllFromIndex('logs', 'by-village', filter.sourceVillage);
      } else if (filter.startTimestamp && filter.endTimestamp) {
        logsToDelete = await this.db.getAllFromIndex(
          'logs', 
          'by-timestamp', 
          IDBKeyRange.bound(filter.startTimestamp, filter.endTimestamp)
        );
      } else if (filter.startTimestamp) {
        logsToDelete = await this.db.getAllFromIndex(
          'logs', 
          'by-timestamp', 
          IDBKeyRange.lowerBound(filter.startTimestamp)
        );
      } else if (filter.endTimestamp) {
        logsToDelete = await this.db.getAllFromIndex(
          'logs', 
          'by-timestamp', 
          IDBKeyRange.upperBound(filter.endTimestamp)
        );
      } else {
        // Get all logs if no specific filter
        logsToDelete = await this.db.getAll('logs');
      }
      
      // Apply additional filters that couldn't be applied via indexes
      logsToDelete = logsToDelete.filter(log => {
        let shouldDelete = true;
        
        if (filter.severity && log.severity !== filter.severity) {
          shouldDelete = false;
        }
        
        if (filter.type && log.type !== filter.type) {
          shouldDelete = false;
        }
        
        if (filter.sourceVillage && log.sourceVillage !== filter.sourceVillage) {
          shouldDelete = false;
        }
        
        if (filter.startTimestamp && log.timestamp < filter.startTimestamp) {
          shouldDelete = false;
        }
        
        if (filter.endTimestamp && log.timestamp > filter.endTimestamp) {
          shouldDelete = false;
        }
        
        return shouldDelete;
      });
      
      // Delete each log individually
      for (const log of logsToDelete) {
        await this.db.delete('logs', log.id);
        count++;
      }
      
      return count;
    }
  };
}
