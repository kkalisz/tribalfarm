import { IDBPDatabase } from 'idb';
import { PlayerSettings } from '@src/shared/hooks/usePlayerSettings';
import { WorldConfig } from '@src/shared/models/game/WorldConfig';
import { v4 as uuidv4 } from 'uuid';
import {TroopsCount} from "@src/shared/models/game/TroopCount";
import {DatabaseSchema} from "@src/shared/db/GameDataBase";
import {Troop} from "@src/shared/models/game/Troop";
import {Building} from "@src/shared/models/game/Building"; // For generating unique identifiers

export class GameDataBaseAccess {

  constructor(private db: IDBPDatabase<DatabaseSchema>) {
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
      return record ? record : [];
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
      return record ? record : [];
    },
  };
}
