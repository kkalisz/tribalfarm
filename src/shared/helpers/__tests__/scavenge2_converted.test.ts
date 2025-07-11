import { describe, it, expect } from 'vitest';
import {
  calculateScavengeOptions,
  ScavengeCalculationMode,
  ScavengeMissionInfo,
  AvailableTroops
} from "../scavenge2_converted";

describe('calculateScavengeOptions', () => {
  it('should calculate scavenge options correctly', () => {
    // Mock available troops
    const availableTroops: AvailableTroops = {
      spear: 1000,
      sword: 1000,
    };

    // Mock mission info
    const missionsInfo: ScavengeMissionInfo[] = [
      {
        id: '0',
        canBeUsed: true,
        isAvailable: true,
        isUnlocked: true,
        finishTime: ''
      },
      {
        id: '1',
        canBeUsed: true,
        isAvailable: true,
        isUnlocked: true,
        finishTime: ''
      },
      {
        id: '2',
        canBeUsed: true,
        isAvailable: true,
        isUnlocked: true,
        finishTime: ''
      },
      {
        id: '3',
        canBeUsed: false,
        isAvailable: false,
        isUnlocked: false,
        finishTime: ''
      }
    ];

    // Calculate scavenge options
    const result = calculateScavengeOptions(
      availableTroops,
      1.25,
      missionsInfo,
      ScavengeCalculationMode.MAX_RESOURCES_PER_HOUR,
      Infinity
    );

    // Verify the result has the expected structure
    expect(result).toBeDefined();
    expect(result.missions).toHaveLength(4);
    expect(result.totalResPerRun).toBeGreaterThan(0);
    expect(result.totalResPerHour).toBeGreaterThan(0);
    expect(result.totalRunTime).toBeGreaterThan(0);

    // Verify each mission has the expected properties
    result.missions.forEach(mission => {
      expect(mission.missionIndex).toBeGreaterThanOrEqual(0);
      expect(mission.missionIndex).toBeLessThanOrEqual(3);
      expect(mission.totalCapacity).toBeGreaterThanOrEqual(0);
      expect(mission.resources).toBeGreaterThanOrEqual(0);
      expect(mission.runTime).toBeGreaterThanOrEqual(0);
      expect(mission.unitsAllocated).toBeDefined();
    });

    console.log(JSON.stringify(result, null, 2));
  });
});