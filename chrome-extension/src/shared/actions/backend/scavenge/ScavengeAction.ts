import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import {buildGameUrlWithScreen} from "@src/shared/helpers/buildUrl";
import {
  calculateScavenge,
  ScavengeCalculationMode,
} from "@src/shared/helpers/calculateScavenge";
import {delayRunRandom} from "@src/shared/helpers/delayRun";
import {validateTribalWarsUrl} from "@src/shared/helpers/location/validateTribalWarsUrl";
import {singleClick} from "@src/shared/actions/content/click/ClickAction";
import {parseScavengePageContent} from "@src/shared/actions/backend/scavenge/parseScavengePageContent";
import {troopsCountToScavengeInputFill} from "@src/shared/actions/helper/troopsCountToScavengeInputFill";

interface StartScavengeActionInput{
  villageId?: string
}

export default async function scavengeAction(context: BackendActionContext, input: StartScavengeActionInput ) {
  //const pageStatus = await context.messenger.executePageStatusAction({});
  // check if is in game verify if url from pageStatus is equals value from pageStatus.details?.url

  if(input.villageId !== undefined) {

    const url = buildGameUrlWithScreen(context.playerSettings.server, {
      village: input.villageId, //TODO
      screen: "place",
      mode: "scavenge",
    }, {})
    await context.messenger.executeNavigateToPageAction({ url, reload: true})
  }


  const pageContent = await context.messenger.executePageStatusAction({})

  if(!validateTribalWarsUrl(pageContent.details?.url ?? "",  "place", undefined,   undefined,"scavenge")){
    return false
  }

  // based on available options
  // based on time that troops needs to be available set by user potentially not defined so no time limits
  // based on not touchable trops by type set by user potentially not set so all troop types can be used
  // based on minimum troops by type to stay in viallage
  // based on disbled by user

  const { troopsCount, scavengeOptions } = parseScavengePageContent(pageContent.details?.pageContent ?? "")

  const scavengePlan = calculateScavenge(troopsCount, context.worldConfig.speed, scavengeOptions, ScavengeCalculationMode.MAX_RESOURCES_PER_HOUR, 0)

  for (const mission of scavengePlan.missions) {
    if(mission.totalCapacity === 0){
      continue
    }
    await delayRunRandom(800, 1500)
    const inputs = troopsCountToScavengeInputFill(mission.unitsAllocated)
    await context.messenger.executeFillInputAction({ inputs})
    await context.messenger.executeClickAction(singleClick(`.scavenge-option:nth-of-type(${mission.missionIndex+1}) .status-specific .free_send_button`))
  }

  //console.log(JSON.stringify(scavengePlan));

  //await saveStringToFile("test.data",pageContent.details?.pageContent ?? "");
  //TODO go to overview and extract all vilalges

  //TODO extract playerId if not extracted yet
}
