import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import {scavengeVillage} from "@src/shared/actions/backend/scavenge/scavengeVillage";

export async function scavengeAllVillages(context: BackendActionContext,): Promise<boolean> {
  const allVillageSettings = await context.gameDatabase.scavengeDb.getAllScavengeSettings();
  const enabledVillageSettings = allVillageSettings.filter(villageSetting => villageSetting.enabled);
  await context.helpers.delayRun();
  for (const villageSettings of enabledVillageSettings) {
    await context.helpers.delayRun();
    await scavengeVillage(context, {
      ...villageSettings,
      scavengeCalculationMode: villageSettings.calculationMode,
      addRepeatScavengeTimer: true
    })
  }

  return true;

}

