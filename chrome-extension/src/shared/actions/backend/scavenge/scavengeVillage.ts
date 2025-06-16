import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import {validateTribalWarsUrl} from "@src/shared/helpers/location/validateTribalWarsUrl";
import {buildGameUrlWithScreen} from "@src/shared/helpers/buildUrl";
import {extractScavengingEndTimes, parseScavengePageContent} from "@src/shared/actions/backend/scavenge/helpers";
import {calculateScavenge, ScavengeCalculationMode, ScavengeMissionsPlan} from "@src/shared/helpers/calculateScavenge";
import {countTroops, subtractTroops, TroopsCount} from "@src/shared/models/game/TroopCount";
import {troopsCountToScavengeInputFill} from "@src/shared/actions/helper/troopsCountToScavengeInputFill";
import {singleClick} from "@src/shared/actions/content/click/ClickAction";
import {logInfo} from "@src/shared/helpers/sendLog";
import {action} from "webextension-polyfill";

export interface StartScavengeActionInput{
  villageId?: string
  lockedTroops?: TroopsCount
  scavengeCalculationMode: ScavengeCalculationMode
  addRepeatScavengeTimer: boolean
}

export interface StartScavengeActionOutput{
  isScavengeRunning: boolean,
  endTimes: Date[]
}

export async function scavengeVillage(context: BackendActionContext, action: StartScavengeActionInput,): Promise<StartScavengeActionOutput> {
  const currentPageStatus = await context.messenger.executePageStatusAction({});
  const urlParams = {
    mode: "scavenge",
    screen: "place",
    village: action.villageId
  }

  const isOnProperPage = validateTribalWarsUrl(currentPageStatus.details?.url ?? "", urlParams);


  logInfo(`is on propper page ${isOnProperPage}`)
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

  await startScavengingOnScreen(context, action, pageContent.details?.pageContent ?? "");
  const scavengingEndTimes = await extractScavengingEndTimes(context);

  if(action.addRepeatScavengeTimer){

  }
  return {
    isScavengeRunning: scavengingEndTimes.length > 0,
    endTimes: scavengingEndTimes,
  }
}

export async function startScavengingOnScreen(context: BackendActionContext, input: StartScavengeActionInput, pageContent: string ): Promise<ScavengeMissionsPlan> {

  const { troopsCount, scavengeOptions } = parseScavengePageContent(pageContent)

  const lockedTroops = !input.lockedTroops
    ? await getLockedTroopsForScavenge(input.villageId, context)
    : input.lockedTroops;

  const troopsThatCanBeUsed = subtractTroops( troopsCount, lockedTroops)

  const scavengePlan = calculateScavenge(troopsThatCanBeUsed, context.worldConfig.speed, scavengeOptions, input.scavengeCalculationMode, 0)

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

async function getLockedTroopsForScavenge(villageId: string | undefined, context: BackendActionContext): Promise<TroopsCount>{
  return { }
}