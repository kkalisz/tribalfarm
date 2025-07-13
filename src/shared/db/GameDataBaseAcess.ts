import { IDBPDatabase } from 'idb';
import { PlayerSettings } from '@src/shared/hooks/usePlayerSettings';
import { WorldConfig } from '@src/shared/models/game/WorldConfig';
import { v4 as uuidv4 } from 'uuid';
import {TroopsCount} from "@src/shared/models/game/TroopCount";
import {DatabaseSchema} from "@src/shared/db/GameDataBase";
import {Troop} from "@src/shared/models/game/Troop";
import {Building} from "@src/shared/models/game/Building";
import {BaseVillageInfo} from "@src/shared/models/game/BaseVillageInfo";
import {ScavengeSettings} from "@src/shared/models/game/ScavengeSettings";

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
}
