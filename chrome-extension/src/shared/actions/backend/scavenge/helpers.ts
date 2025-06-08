import {TroopsCount} from "@src/shared/models/game/TroopCount";
import {TroopName} from "@src/shared/models/game/Troop";
import {ScavengeMissionInfo} from "@src/shared/helpers/calculateScavenge";
import {AllTroopNames} from "@src/shared/models/game/Troops";
import {PageParser} from "@src/shared/helpers/PageParser";
import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import {parseTimeToMiliSeconds} from "@src/shared/helpers/parseTimeToMiliSeconds";
import {addMiliSecondsTo} from "@src/shared/helpers/addMiliSecondsToNow";


function getScavengeStatus(index: number, element: Element): ScavengeMissionInfo {
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

function extractTroopsCount(candidateSquadContainer: Element): TroopsCount {
  const TroopsCount: TroopsCount = {};

  // Query all troop rows from the candidate-squad-container
  const troopRows = candidateSquadContainer.querySelectorAll(
    "a.units-entry-all.squad-village-required"
  );

  troopRows.forEach((troopRow) => {
    const unitType = troopRow.getAttribute("data-unit"); // e.g., "spear"
    const availableCountText = troopRow.textContent?.trim() || ""; // e.g., "(328)"
    const availableCount = parseInt(availableCountText.replace(/[()]/g, ""), 10); // Extract the number

    if (unitType && AllTroopNames.includes(unitType as TroopName) && !isNaN(availableCount)) {
      TroopsCount[unitType as TroopName] = availableCount;
    }
  });
  return TroopsCount;
}

export function parseScavengePageContent(pageContent: string) {
  const pageParser = new PageParser(pageContent);

  const scavengePanel = pageParser.createChildParserByDivClass("scavenge-screen-main-widget")
  const optionsContainer = scavengePanel.queryByDivClass("options-container")
  const troopsContainer = scavengePanel.queryByClass("candidate-squad-container")
  const scavengeOptionsElements = Array.from(optionsContainer.item(0).children);

  const troopsCount = extractTroopsCount(troopsContainer.item(0));
  const scavengeOptions = scavengeOptionsElements.map((value, index) => getScavengeStatus(index, value))
  return {
    troopsCount,
    scavengeOptions
  }
}

export async function extractScavengingEndTimes(context: BackendActionContext) {
  const refreshedPageContent = await context.messenger.executePageStatusAction({})
  const pageParser = new PageParser(refreshedPageContent.details?.pageContent ?? "");
  const countdowns = pageParser.queryByClass("return_countdown")

  // for now simplify we don't need info what exact level is finished when
  return Array.from(countdowns).map(countdown => {
    return parseTimeToMiliSeconds(countdown.textContent)
  }).filter(minutes => minutes !== null).map(minutes => addMiliSecondsTo(minutes));
}