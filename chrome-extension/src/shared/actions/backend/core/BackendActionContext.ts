import {PlayerSettings} from "@src/shared/hooks/usePlayerSettings";
import {MessengerWrapper} from "@src/shared/actions/content/core/MessengerWrapper";
import {WorldConfig} from "@src/shared/models/game/WorldConfig";
import {delayRunRandom} from "@src/shared/helpers/delayRun";
import {ActionScheduler} from "@src/shared/actions/backend/core/ActionScheduler";
import {GameDataBase} from "@src/shared/db/GameDataBase";

export class BackendActionHelpers {

  constructor() {
  }

  async delayRun(){
    await delayRunRandom(800, 1500)
  }
};

export interface BackendActionContext {
  messenger: MessengerWrapper;
  playerSettings: PlayerSettings;
  worldConfig: WorldConfig;
  helpers: BackendActionHelpers;
  scheduler: ActionScheduler;
  gameDatabase: GameDataBase;
}
