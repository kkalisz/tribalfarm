import {PlayerSettings} from "@src/shared/hooks/usePlayerSettings";
import {MessengerWrapper} from "@src/shared/actions/content/core/MessengerWrapper";
import {delayRunRandom} from "@src/shared/helpers/delayRun";
import {ActionScheduler} from "@src/shared/actions/backend/core/ActionScheduler";
import {GameDataBaseAccess} from "@src/shared/db/GameDataBaseAcess";
import {ServerConfig} from "@pages/background/serverConfig";

export class BackendActionHelpers {

  constructor(private havePremium: boolean) {
  }

  async delayRun(){
    await delayRunRandom(800, 1500)
  }

  async runBasedOnPremium<T>(
    premiumFn: () => T,
    freeFn: () => T
  ): Promise<T> {
    return this.havePremium ? premiumFn() : freeFn();
  }
}

export interface BackendActionContext {
  messenger: MessengerWrapper;
  playerSettings: PlayerSettings;
  serverConfig: ServerConfig;
  helpers: BackendActionHelpers;
  scheduler: ActionScheduler;
  gameDatabase: GameDataBaseAccess;
  hasPremium: boolean;
}
