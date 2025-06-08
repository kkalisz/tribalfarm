import {describe, it} from 'vitest';
import {TroopsCount} from "@src/shared/actions/backend/scavenge/ScavengeVillageAction";
import {calculateScavenge, ScavengeCalculationMode, ScavengeMissionInfo} from "@src/shared/helpers/calculateScavenge";

describe('calculateScavengeOptions', () => {
    it('should calculate scavenge options',
      () => {
        const allUnitsElements: TroopsCount = {
          spear: 1000,
          sword: 1000,
        };
        const mockMissions: ScavengeMissionInfo[] = [{
          id: '0',
          canBenUsed: true,
          isAvailable: true,
          isUnlocked: true,
          finishTime: ''
        }, {
          id: '1',
          canBenUsed: true,
          isAvailable: true,
          isUnlocked: true,
          finishTime: ''
        }, {
          id: '2',
          canBenUsed: true,
          isAvailable: true,
          isUnlocked: true,
          finishTime: ''
        }, {
          id: '3',
          canBenUsed: false,
          isAvailable: false,
          isUnlocked: false,
          finishTime: ''
        }];

        const result = calculateScavenge(allUnitsElements, 1.25, mockMissions, ScavengeCalculationMode.MAX_RESOURCES_PER_HOUR, Infinity)
        console.log(JSON.stringify(result, null, 2))
      })
  }
);