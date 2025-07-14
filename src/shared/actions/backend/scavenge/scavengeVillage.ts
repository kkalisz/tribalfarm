import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import {validateTribalWarsUrl} from "@src/shared/helpers/location/validateTribalWarsUrl";
import {buildGameUrlWithScreen} from "@src/shared/helpers/buildUrl";
import {extractScavengingEndTimes, parseScavengePageContent} from "@src/shared/actions/backend/scavenge/helpers";
import {
  calculateScavenge,
  ScavengeCalculationMode,
  ScavengeMissionsPlan
} from "@src/shared/actions/backend/scavenge/calculateScavenge";
import {countTroops, subtractTroops, TroopsCount} from "@src/shared/models/game/TroopCount";
import {troopsCountToScavengeInputFill} from "@src/shared/actions/helper/troopsCountToScavengeInputFill";
import {singleClick} from "@src/shared/actions/content/click/ClickAction";
import {logInfo} from "@src/shared/helpers/sendLog";
import {SCAVENGE_VILLAGE_ACTION} from "@src/shared/actions/backend/scavenge/ScavengeVillageAction";
import {ScavengeSettings} from "@src/shared/models/game/ScavengeSettings";

export interface StartScavengeActionInput{
  villageId: string
  lockedTroops?: TroopsCount
  scavengeCalculationMode?: ScavengeCalculationMode
  addRepeatScavengeTimer: boolean
  oneTimeRun?: boolean
}

export interface StartScavengeActionOutput{
  isScavengeRunning: boolean,
  endTimes: Date[]
}

export async function scavengeVillage(context: BackendActionContext, action: StartScavengeActionInput,): Promise<StartScavengeActionOutput> {
  const scavengeSettings = await context.gameDatabase.scavengeDb.getScavengeSettings(action.villageId)

  if(scavengeSettings?.enabled === false && !action.oneTimeRun){
    return {
      isScavengeRunning: false,
      endTimes: [],
    }
  }

  const currentPageStatus = await context.messenger.executePageStatusAction({});
  const urlParams = {
    mode: "scavenge",
    screen: "place",
    village: action.villageId
  }

  const isOnProperPage = validateTribalWarsUrl(currentPageStatus.details?.url ?? "", urlParams);

  if (!isOnProperPage) {
    const url = buildGameUrlWithScreen(context.playerSettings.server, urlParams)
    await context.messenger.executeNavigateToPageAction({url, reload: true})
  }

  const pageContent = await context.messenger.executePageStatusAction({})

  logInfo(`page url ${pageContent.details?.url} ${validateTribalWarsUrl(pageContent.details?.url ?? "", urlParams)}`)

  if (!validateTribalWarsUrl(pageContent.details?.url ?? "", urlParams)) {
    return {
      isScavengeRunning: false,
      endTimes: [],
    }
  }


  await startScavengingOnScreen(context, action, scavengeSettings ?? null, pageContent.details?.pageContent ?? "");
  const scavengingEndTimes = await extractScavengingEndTimes(context);

  if(action.addRepeatScavengeTimer && !!scavengingEndTimes.length){
    const lowestEndTime =  Math.min(...scavengingEndTimes.map(date => date.getTime()))
    const runAt = new Date(lowestEndTime + 1000); // Schedule 1 second after the earliest scavenge completes

    // Using the new parameter object approach
    context.scheduler.scheduleTask<StartScavengeActionInput>({
      type: SCAVENGE_VILLAGE_ACTION,
      input: {
        villageId: action.villageId,
        lockedTroops: action.lockedTroops,
        scavengeCalculationMode: action.scavengeCalculationMode,
        addRepeatScavengeTimer: action.addRepeatScavengeTimer
      },
      runAt: runAt,
    });
  }
  return {
    isScavengeRunning: scavengingEndTimes.length > 0,
    endTimes: scavengingEndTimes,
  }
}

export async function startScavengingOnScreen(context: BackendActionContext, input: StartScavengeActionInput, scavengeSettings: ScavengeSettings | null, pageContent: string ): Promise<ScavengeMissionsPlan> {

  const { troopsCount, scavengeOptions } = parseScavengePageContent(pageContent)

  const lockedTroops = input.lockedTroops ?? scavengeSettings?.troopsExcluded ?? {}
  const troopsThatCanBeUsed = subtractTroops( troopsCount, lockedTroops)
  const calculationMode = input.scavengeCalculationMode ?? scavengeSettings?.calculationMode ?? ScavengeCalculationMode.SAME_RETURN_TIME

  const scavengePlan = calculateScavenge(troopsThatCanBeUsed, context.serverConfig.worldConfig.speed, scavengeOptions, calculationMode, 0)

  for (const mission of scavengePlan.missions) {
    if(countTroops(mission.unitsAllocated) <= 10){
      //TOD log
      continue
    }
    await context.helpers.delayRun();
    const inputs = troopsCountToScavengeInputFill(mission.unitsAllocated)
    await context.messenger.executeFillInputAction({ inputs})
    await context.messenger.executeClickAction(singleClick(`.scavenge-option:nth-of-type(${mission.missionIndex+1}) .status-specific .free_send_button`))
  }
  return scavengePlan;
}