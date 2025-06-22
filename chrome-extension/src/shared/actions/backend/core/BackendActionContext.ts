import {PlayerSettings} from "@src/shared/hooks/usePlayerSettings";
import {MessengerWrapper} from "@src/shared/actions/content/core/MessengerWrapper";
import {WorldConfig} from "@src/shared/models/game/WorldConfig";
import {delayRunRandom} from "@src/shared/helpers/delayRun";
import {ActionScheduler} from "@src/shared/actions/backend/core/ActionScheduler";
import {GameDataBaseAccess} from "@src/shared/db/GameDataBaseAcess";
import {ServerConfig} from "@pages/background/serverConfig";

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
  serverConfig: ServerConfig;
  helpers: BackendActionHelpers;
  scheduler: ActionScheduler;
  gameDatabase: GameDataBaseAccess;
}
