import {TroopsCount} from "@src/shared/models/game/TroopCount";
import {FillInputAction, InputParam, toInputValueWithoutZero} from "@src/shared/actions/content/fillInput/FillInputAction";
import {TroopName} from "@src/shared/models/game/Troop";

export function troopsCountToScavengeInputFill(troopsCount: TroopsCount): InputParam[] {
  return Object.keys(troopsCount).map(key => {
    return {
      selector: `input[name="${key}"]`,
      value: toInputValueWithoutZero(troopsCount[key as TroopName]?.toString())
    }
  })
}

export function troopsCountToScavengeInputFillAction(troopsCount: TroopsCount): FillInputAction {
  return {
    inputs: troopsCountToScavengeInputFill(troopsCount)
  }
}