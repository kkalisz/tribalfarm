import {describe, it} from 'vitest';
import {calculateScavenge, ScavengeCalculationMode, ScavengeMissionInfo} from "@src/shared/actions/backend/scavenge/calculateScavenge";
import {TroopsCount} from '@src/shared/models/game/TroopCount';

describe('calculateScavengeOptions', () => {
    it('should calculate scavenge options',
      () => {
        const allUnitsElements: TroopsCount = {
          spear: 1000,
          sword: 1000,
        };
        const mockMissions: ScavengeMissionInfo[] = [{
          id: '0',
          canBenUsed: false,
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

        const result = calculateScavenge(allUnitsElements, 1.25, mockMissions, ScavengeCalculationMode.MAX_RESOURCES_PER_HOUR, 0)
        console.log(JSON.stringify(result, null, 2))
      })

  it('should calculate scavenge',
    () => {
      const allUnitsElements: TroopsCount = {
        spear: 117,
        sword: 28,
      };
      const mockMissions: ScavengeMissionInfo[] = [{
        id: '0',
        canBenUsed: true,
        isAvailable: false,
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
        isAvailable: false,
        isUnlocked: false,
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