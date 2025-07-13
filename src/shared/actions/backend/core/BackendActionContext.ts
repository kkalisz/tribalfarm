import {PlayerSettings} from "@src/shared/hooks/usePlayerSettings";
import {MessengerWrapper} from "@src/shared/actions/content/core/MessengerWrapper";
import {delayRunRandom} from "@src/shared/helpers/delayRun";
import {ActionScheduler} from "@src/shared/actions/backend/core/ActionScheduler";
import {GameDataBaseAccess} from "@src/shared/db/GameDataBaseAcess";
import {ServerConfig} from "@pages/background/serverConfig";

export class BackendActionHelpers {

  constructor(private readonly database: GameDataBaseAccess) {
  }

  async hasPremium(): Promise<boolean> {
    const hasPremium =  (await this.database.settingDb.getPlayerSettings())?.hasPremium ?? false;
    console.log('hasPremium', hasPremium);
    return hasPremium;
  }

  async delayRun(){
    await delayRunRandom(800, 1500)
  }

  async runBasedOnPremium<T>(
    premiumFn: () => T,
    freeFn: () => T
  ): Promise<T> {
    return (await this.hasPremium()) ? premiumFn() : freeFn();
  }
}

export interface BackendActionContext {
  messenger: MessengerWrapper;
  playerSettings: PlayerSettings;
  serverConfig: ServerConfig;
  helpers: BackendActionHelpers;
  scheduler: ActionScheduler;
  gameDatabase: GameDataBaseAccess;
}
