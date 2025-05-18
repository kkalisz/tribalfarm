import {AvailableTroops} from "@src/shared/actions/backend/startScavengeAction";
import {
  MissionResult,
  MissionsStats,
  ScavengeCalculationMode,
  ScavengeMissionInfo
} from "@src/shared/helpers/calculateScavenge";

interface  UnitInfo {
  cap: number;
  cnt: number;
}


interface TroopDistribution {
  [key: string]: {
    spear: number;
    sword: number;
    axe: number;
    archer: number;
    light: number;
    marcher: number;
    heavy: number;
  }
}

/**
 * Calculates the duration factor based on world speed
 */
function getDurationFactor(worldSpeed: number): number {
  return Math.pow(worldSpeed, -0.55);
}

/**
 * Returns how well the current distribution is doing.
 * If RPH, this returns the resources per hour, if RPR it returns the resources per run.
 */
function getLossFunctionOutput(iCap: number, r: number[], iMaxDuration: number,   scavengeCalculationMode: ScavengeCalculationMode
  , worldSpeed: number): number {
  switch (scavengeCalculationMode) {
    case ScavengeCalculationMode.MAX_RESOURCES_PER_RUN: {
      const oGain = fnGain(iCap, r, iMaxDuration, worldSpeed);
      return oGain["FF"] + oGain["BB"] + oGain["SS"] + oGain["RR"];
    }
    case ScavengeCalculationMode.MAX_RESOURCES_PER_HOUR: return fnRPH(iCap, r, iMaxDuration, worldSpeed);
    default: return 0;
  }
}

/**
 * Pads a number with leading zero if needed
 */
function fnPadTime(num: number): string {
  const s = "0" + num;
  return s.substr(s.length - 2);
}

/**
 * Calculates the duration for each mission type
 */
function fnDuration(iCap: number, r: number[], iMaxDuration: number, worldSpeed: number): Record<string, number> {
  const iMaxCap = fnDurationToCap(iMaxDuration, r, worldSpeed);
  const durationFactor = getDurationFactor(worldSpeed);

  return {
    "FF": r[0] === 0 ? 0 : ((Math.pow(Math.pow(r[0] * Math.min(iCap, iMaxCap["FF"]), 2) * 100 * Math.pow(0.10, 2), 0.45) + 1800) * durationFactor),
    "BB": r[1] === 0 ? 0 : ((Math.pow(Math.pow(r[1] * Math.min(iCap, iMaxCap["BB"]), 2) * 100 * Math.pow(0.25, 2), 0.45) + 1800) * durationFactor),
    "SS": r[2] === 0 ? 0 : ((Math.pow(Math.pow(r[2] * Math.min(iCap, iMaxCap["SS"]), 2) * 100 * Math.pow(0.50, 2), 0.45) + 1800) * durationFactor),
    "RR": r[3] === 0 ? 0 : ((Math.pow(Math.pow(r[3] * Math.min(iCap, iMaxCap["RR"]), 2) * 100 * Math.pow(0.75, 2), 0.45) + 1800) * durationFactor)
  };
}

/**
 * Calculates the max capacity given a max duration.
 */
function fnDurationToCap(iDuration: number, r: number[], worldSpeed: number): Record<string, number> {
  const durationFactor = getDurationFactor(worldSpeed);

  if (iDuration === Infinity) {
    return {
      "FF": Infinity,
      "BB": Infinity,
      "SS": Infinity,
      "RR": Infinity
    };
  }

  return {
    "FF": r[0] === 0 ? 0 : Math.pow(Math.pow((iDuration / durationFactor) - 1800, 1 / 0.45) / Math.pow(0.10, 2) / 100, 1 / 2),
    "BB": r[1] === 0 ? 0 : Math.pow(Math.pow((iDuration / durationFactor) - 1800, 1 / 0.45) / Math.pow(0.25, 2) / 100, 1 / 2),
    "SS": r[2] === 0 ? 0 : Math.pow(Math.pow((iDuration / durationFactor) - 1800, 1 / 0.45) / Math.pow(0.50, 2) / 100, 1 / 2),
    "RR": r[3] === 0 ? 0 : Math.pow(Math.pow((iDuration / durationFactor) - 1800, 1 / 0.45) / Math.pow(0.75, 2) / 100, 1 / 2)
  };
}

/**
 * Calculates the gain for each mission type
 */
function fnGain(iCap: number, r: number[], iMaxDuration: number, worldSpeed: number): Record<string, number> {
  const iMaxCap = fnDurationToCap(iMaxDuration, r, worldSpeed);

  return {
    "FF": Math.round(Math.min(r[0] * iCap, iMaxCap["FF"]) * 0.10),
    "BB": Math.round(Math.min(r[1] * iCap, iMaxCap["BB"]) * 0.25),
    "SS": Math.round(Math.min(r[2] * iCap, iMaxCap["SS"]) * 0.50),
    "RR": Math.round(Math.min(r[3] * iCap, iMaxCap["RR"]) * 0.75)
  };
}

/**
 * Calculates resources per hour
 */
function fnRPH(iCap: number, r: number[], iMaxDuration: number, worldSpeed: number): number {
  const oDuration = fnDuration(iCap, r, iMaxDuration, worldSpeed);
  const oGain = fnGain(iCap, r, iMaxDuration, worldSpeed);

  return (
    (oGain["FF"] === 0 ? 0 : oGain["FF"] / oDuration["FF"]) +
    (oGain["BB"] === 0 ? 0 : oGain["BB"] / oDuration["BB"]) +
    (oGain["SS"] === 0 ? 0 : oGain["SS"] / oDuration["SS"]) +
    (oGain["RR"] === 0 ? 0 : oGain["RR"] / oDuration["RR"])
  ) * 60 * 60;
}

/**
 * Deep clone an object
 */
function cp<T>(o: T): T {
  return JSON.parse(JSON.stringify(o));
}

/**
 * Tries to move R from raid 1 to raid 2, to see if it improves the loss function.
 */
function doTryMoveFromRaid1ToRaid2(
  iCap: number, 
  r: number[], 
  iChange: number, 
  iRaid1: number, 
  iRaid2: number, 
  iMaxDuration: number,
  scavengeCalculationMode: ScavengeCalculationMode,
  worldSpeed: number
): number[] {
  if (iRaid1 === iRaid2) {
    return r;
  }

  const iUnchanged = getLossFunctionOutput(iCap, r, iMaxDuration, scavengeCalculationMode, worldSpeed);

  const rChanged = cp(r);
  if (iChange > rChanged[iRaid2]) {
    iChange = rChanged[iRaid2];
  }

  rChanged[iRaid1] += iChange;
  rChanged[iRaid2] -= iChange;

  const iChanged = getLossFunctionOutput(iCap, rChanged, iMaxDuration, scavengeCalculationMode, worldSpeed);

  if (iChanged > iUnchanged) {
    return rChanged;
  } else {
    return r;
  }
}

/**
 * Returns the optimal troop distribution given the parameters and optimization method.
 */
function getOptimalDistribution(
  scavengeCalculationMode: ScavengeCalculationMode,
  r: number[], 
  iCap: number, 
  iMaxDuration: number, 
  aRaidChecked: boolean[],
  worldSpeed: number
): [number[], number] {
  let iIterations = 0;

  if (scavengeCalculationMode === ScavengeCalculationMode.SAME_RETURN_TIME) {
    // The original calculation is good enough.
    /*
    RT 1 : 7,5 / 13
    RT 2 : 3 / 13
    RT 3 : 1,5 / 13
    RT 4 : 1 / 13
    */
  } else {
    let iCurrent = getLossFunctionOutput(iCap, r, iMaxDuration, scavengeCalculationMode, worldSpeed);
    let bContinue = true;

    while (bContinue) {
      for (let raidL = 0; raidL <= 3; raidL++) {
        if (!aRaidChecked[raidL]) {
          continue;
        }

        for (let raidR = 0; raidR <= 3; raidR++) {
          if (!aRaidChecked[raidR]) {
            continue;
          }

          let iChange = r[raidL] / 1.2;
          for (let i = 0; i < 10; i++) {
            r = doTryMoveFromRaid1ToRaid2(iCap, r, iChange, raidL, raidR, iMaxDuration, scavengeCalculationMode, worldSpeed);
            iChange /= 1.2;
          }

          iIterations += 1;
        }
      }

      const iNew = getLossFunctionOutput(iCap, r, iMaxDuration, scavengeCalculationMode, worldSpeed);
      if (iNew > iCurrent) {
        bContinue = true;
        iCurrent = iNew;
      } else {
        bContinue = false;
      }
    }
  }

  return [r, iIterations];
}

/**
 * Main calculation function
 */
export function calculateScavengeImpl(
  allUnitsElements: AvailableTroops,
  worldSpeed: number,
  missionsInfo: ScavengeMissionInfo[],
  scavengeCalculationMode: ScavengeCalculationMode,
  timeLimitInMinutes: number = Infinity
): MissionsStats {
  // Convert time limit to seconds
  const iMaxDuration = timeLimitInMinutes === 0 || timeLimitInMinutes === Infinity 
    ? Infinity 
    : timeLimitInMinutes * 60;

  // Calculate total capacity from available units
  const iUnits: Record<string, UnitInfo> = {
    Sp: { cap: 25, cnt: allUnitsElements.spear || 0 },
    Sw: { cap: 15, cnt: allUnitsElements.sword || 0 },
    Ax: { cap: 10, cnt: allUnitsElements.axe || 0 },
    Ar: { cap: 10, cnt: allUnitsElements.archer || 0 },
    LC: { cap: 80, cnt: allUnitsElements.light || 0 },
    MA: { cap: 50, cnt: allUnitsElements.marcher || 0 },
    HC: { cap: 50, cnt: allUnitsElements.heavy || 0 }
  };

  const iCap = iUnits.Sp.cap * iUnits.Sp.cnt +
    iUnits.Sw.cap * iUnits.Sw.cnt +
    iUnits.Ax.cap * iUnits.Ax.cnt +
    iUnits.Ar.cap * iUnits.Ar.cnt +
    iUnits.LC.cap * iUnits.LC.cnt +
    iUnits.MA.cap * iUnits.MA.cnt +
    iUnits.HC.cap * iUnits.HC.cnt;

  // Determine which missions are available
  const aRaidChecked = [
    missionsInfo[0]?.isUnlocked && missionsInfo[0]?.isAvailable && missionsInfo[0]?.canBenUsed || false,
    missionsInfo[1]?.isUnlocked && missionsInfo[1]?.isAvailable && missionsInfo[1]?.canBenUsed || false,
    missionsInfo[2]?.isUnlocked && missionsInfo[2]?.isAvailable && missionsInfo[2]?.canBenUsed || false,
    missionsInfo[3]?.isUnlocked && missionsInfo[3]?.isAvailable && missionsInfo[3]?.canBenUsed || false
  ];

  // Initialize distribution ratios
  let r = [
    aRaidChecked[0] ? 7.5 : 0, 
    aRaidChecked[1] ? 3 : 0, 
    aRaidChecked[2] ? 1.5 : 0, 
    aRaidChecked[3] ? 1 : 0
  ];

  // Normalize ratios
  const iDiv = r[0] + r[1] + r[2] + r[3] || 1; // Avoid division by zero
  r[0] /= iDiv;
  r[1] /= iDiv;
  r[2] /= iDiv;
  r[3] /= iDiv;

  // Get optimal distribution
  const [optimizedR, iIterations] = getOptimalDistribution(scavengeCalculationMode, r, iCap, iMaxDuration, aRaidChecked, worldSpeed);

  // Calculate capacities based on optimal distribution
  const iMaxCap = fnDurationToCap(iMaxDuration, optimizedR, worldSpeed);
  const iCaps = {
    FF: Math.round(Math.min(iMaxCap.FF, iCap * optimizedR[0])),
    BB: Math.round(Math.min(iMaxCap.BB, iCap * optimizedR[1])),
    SS: Math.round(Math.min(iMaxCap.SS, iCap * optimizedR[2])),
    RR: Math.round(Math.min(iMaxCap.RR, iCap * optimizedR[3]))
  };

  // Create a copy of units for allocation
  const unitsForAllocation = { ...iUnits };

  // Result object
  const result: TroopDistribution = {};

  // Function to fill a raid with units
  const fillRaid = (raid: string): MissionResult => {
    result[raid] = {
      spear: 0,
      sword: 0,
      axe: 0,
      archer: 0,
      light: 0,
      marcher: 0,
      heavy: 0
    };

    // Function to allocate units to a raid
    const fill = (raidKey: string, unitKey: string, unitInfo: UnitInfo): number => {
      const count = Math.min(unitInfo.cnt, Math.floor(iCaps[raidKey] / unitInfo.cap));
      iCaps[raidKey] -= count * unitInfo.cap;
      unitInfo.cnt -= count;
      return count;
    };

    // Allocate units in order of priority
    result[raid].light = fill(raid, "LC", unitsForAllocation.LC);
    result[raid].heavy = fill(raid, "HC", unitsForAllocation.HC);
    result[raid].marcher = fill(raid, "MA", unitsForAllocation.MA);
    result[raid].spear = fill(raid, "Sp", unitsForAllocation.Sp);
    result[raid].sword = fill(raid, "Sw", unitsForAllocation.Sw);
    result[raid].axe = fill(raid, "Ax", unitsForAllocation.Ax);
    result[raid].archer = fill(raid, "Ar", unitsForAllocation.Ar);

    // Calculate total capacity for this raid
    const totalCapacity = 
      result[raid].spear * 25 +
      result[raid].sword * 15 +
      result[raid].axe * 10 +
      result[raid].archer * 10 +
      result[raid].light * 80 +
      result[raid].marcher * 50 +
      result[raid].heavy * 50;

    // Calculate resources and runtime
    let resourceMultiplier = 0;
    if (raid === "FF") resourceMultiplier = 0.1;
    else if (raid === "BB") resourceMultiplier = 0.25;
    else if (raid === "SS") resourceMultiplier = 0.5;
    else if (raid === "RR") resourceMultiplier = 0.75;

    const resources = Math.round(totalCapacity * resourceMultiplier);
    const runTime = totalCapacity === 0 ? 0 : 
      (Math.pow(Math.pow(totalCapacity, 2) * 100 * Math.pow(resourceMultiplier, 2), 0.45) + 1800) * getDurationFactor(worldSpeed);

    // Create unitsAllocated object for the result
    const unitsAllocated: { [unitName: string]: number } = {
      spear: result[raid].spear,
      sword: result[raid].sword,
      axe: result[raid].axe,
      archer: result[raid].archer,
      light: result[raid].light,
      marcher: result[raid].marcher,
      heavy: result[raid].heavy
    };

    return {
      missionIndex: raid === "RR" ? 3 : raid === "SS" ? 2 : raid === "BB" ? 1 : 0,
      totalCapacity,
      resources,
      runTime,
      unitsAllocated
    };
  };

  // Fill raids in order of priority
  const missions: MissionResult[] = [];
  if (aRaidChecked[3]) missions.push(fillRaid("RR"));
  if (aRaidChecked[2]) missions.push(fillRaid("SS"));
  if (aRaidChecked[1]) missions.push(fillRaid("BB"));
  if (aRaidChecked[0]) missions.push(fillRaid("FF"));

  // Calculate totals
  let totalResPerRun = 0;
  let totalResPerHour = 0;
  let totalRunTime = 0;

  for (const mission of missions) {
    totalResPerRun += mission.resources;
    totalResPerHour += mission.runTime === 0 ? 0 : (mission.resources / mission.runTime) * 60 * 60;
    totalRunTime = Math.max(totalRunTime, mission.runTime);
  }

  // Return the final result
  return {
    missions,
    totalResPerRun,
    totalResPerHour,
    totalRunTime
  };
}
