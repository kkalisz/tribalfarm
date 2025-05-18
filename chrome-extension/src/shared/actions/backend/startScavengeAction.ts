import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import {buildGameUrlWithScreen} from "@src/shared/helpers/buildUrl";
import {PageParser} from "@src/shared/helpers/PageParser";
import {saveStringToFile} from "@src/shared/helpers/saveStringToFile";
import {Element} from "linkedom";
import {TroopName} from "@src/shared/models/game/Troop";
import {AllTroopNames} from "@src/shared/models/game/Troops";
import {
  calculateScavenge,
  ScavengeCalculationMode,
  ScavengeMissionInfo
} from "@src/shared/helpers/calculateScavenge";

interface StartScavengeActionInput{
  villageId: string
}

function getScavengeStatus(index: number, element: Element): ScavengeMissionInfo{

  const isUnlocked = element.querySelector('.inactive-view') !== null || element.querySelector('.in-progress-view') !== null
  const isAvailable = element.querySelector('.inactive-view') !== null
  const durationText = element.querySelector('.duration')?.textContent?.trim(); // E.g., "0:26:32"
  const finishTime = durationText ? calculateFinishTimestamp(durationText) : '';

  return {
    id: index.toString(),
    canBenUsed: true, //TODO
    isUnlocked,
    isAvailable,
    finishTime,
  };
}

function calculateFinishTimestamp(duration: string): string {
  const [hours, minutes, seconds] = duration.split(':').map(Number); // Split into components
  const durationMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000; // Convert to milliseconds

  const now = Date.now(); // Current timestamp
  return (now + durationMilliseconds).toString(); // Add duration to current time and return as string
}

export type AvailableTroops = {
  [key in TroopName]?: number;
};

function extractAvailableTroops(candidateSquadContainer: Element): AvailableTroops {

  const availableTroops: AvailableTroops = {};

  // Query all troop rows from the candidate-squad-container
  const troopRows = candidateSquadContainer.querySelectorAll(
    "a.units-entry-all.squad-village-required"
  );

  troopRows.forEach((troopRow) => {
    const unitType = troopRow.getAttribute("data-unit"); // e.g., "spear"
    const availableCountText = troopRow.textContent?.trim() || ""; // e.g., "(328)"
    const availableCount = parseInt(availableCountText.replace(/[()]/g, ""), 10); // Extract the number

    if (unitType && AllTroopNames.includes(unitType as TroopName) && !isNaN(availableCount)) {
      availableTroops[unitType as TroopName] = availableCount;
    }
  });
  return availableTroops;
}


export default async function startScavengeAction(context: BackendActionContext, input: StartScavengeActionInput ) {
  //const pageStatus = await context.messenger.executePageStatusAction({});
  // check if is in game verify if url from pageStatus is equals value from pageStatus.details?.url
  const url = buildGameUrlWithScreen(context.playerSettings.server,{
    village: input.villageId, //TODO
    screen : "place",
    mode: "scavenge",
  }, {})

  await context.messenger.executeNavigateToPageAction({ url, reload: true})

  const pageContent = await context.messenger.executePageStatusAction({})
  const pageParser = new PageParser(pageContent.details?.pageContent ?? "");


  const scavengePanel = pageParser.createChildParserByDivClass("scavenge-screen-main-widget")
  const optionsContainer = scavengePanel.queryByDivClass("options-container")
  const troopsContainer = scavengePanel.queryByClass("candidate-squad-container")
  const scavengeOptionsElements = Array.from(optionsContainer.item(0).children);

  const availableTroops = extractAvailableTroops(troopsContainer.item(0));
  const scavengeOptions = scavengeOptionsElements.map((value, index) => getScavengeStatus(index, value))

  // based on available options
  // based on time that troops needs to be available set by user potentially not defined so no time limits
  // based on not touchable trops by type set by user potentially not set so all troop types can be used
  // based on minimum troops by type to stay in viallage
  // based on disbled by user

  const scavengePlan = calculateScavenge(availableTroops, 1.2, scavengeOptions, ScavengeCalculationMode.MAX_RESOURCES_PER_HOUR, 0)

  console.log(JSON.stringify(scavengePlan));


  await saveStringToFile("test.data",pageContent.details?.pageContent ?? "");
  //TODO go to overview and extract all vilalges

  //TODO extract playerId if not extracted yet
}

