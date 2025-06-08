import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import {validateTribalWarsUrl} from "@src/shared/helpers/location/validateTribalWarsUrl";
import {buildGameUrlWithScreen} from "@src/shared/helpers/buildUrl";
import {extractScavengingEndTimes, parseScavengePageContent} from "@src/shared/actions/backend/scavenge/helpers";
import {calculateScavenge, ScavengeCalculationMode, ScavengeMissionsPlan} from "@src/shared/helpers/calculateScavenge";
import {subtractTroops, TroopsCount} from "@src/shared/models/game/TroopCount";
import {delayRunRandom} from "@src/shared/helpers/delayRun";
import {troopsCountToScavengeInputFill} from "@src/shared/actions/helper/troopsCountToScavengeInputFill";
import {singleClick} from "@src/shared/actions/content/click/ClickAction";

export interface StartScavengeActionInput{
  villageId?: string
  lockedTroops?: TroopsCount
}

export async function scavengeVillage(context: BackendActionContext, action: StartScavengeActionInput,): Promise<boolean> {
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

  if (!validateTribalWarsUrl(pageContent.details?.url ?? "", urlParams)) {
    return false
  }

  await startScavengingOnScreen(context, action, pageContent.details?.pageContent ?? "");
  const scavengingEndTimes = await extractScavengingEndTimes(context);
  return scavengingEndTimes.length > 0;
}

export async function startScavengingOnScreen(context: BackendActionContext, input: StartScavengeActionInput, pageContent: string ): Promise<ScavengeMissionsPlan> {

  const { troopsCount, scavengeOptions } = parseScavengePageContent(pageContent)

  const lockedTroops = !input.lockedTroops
    ? await getLockedTroopsForScavenge(input.villageId, context)
    : input.lockedTroops;

  const troopsThatCanBeUsed = subtractTroops( troopsCount, lockedTroops)

  const scavengePlan = calculateScavenge(troopsThatCanBeUsed, context.worldConfig.speed, scavengeOptions, ScavengeCalculationMode.MAX_RESOURCES_PER_HOUR, 0)

  for (const mission of scavengePlan.missions) {
    if(mission.totalCapacity === 0){
      continue
    }
    await delayRunRandom(800, 1500)
    const inputs = troopsCountToScavengeInputFill(mission.unitsAllocated)
    await context.messenger.executeFillInputAction({ inputs})
    await context.messenger.executeClickAction(singleClick(`.scavenge-option:nth-of-type(${mission.missionIndex+1}) .status-specific .free_send_button`))
  }
  return scavengePlan;
}

async function getLockedTroopsForScavenge(villageId: string | undefined, context: BackendActionContext): Promise<TroopsCount>{
  return { }
}