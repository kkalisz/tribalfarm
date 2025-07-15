import { describe, it, expect } from 'vitest';
import {
  calculateScavengeDistribution,
  UnitCarryCapacity,
  LootConstants,
} from "../calculateScavenge2Impl";

describe('calculateScavengeDistribution', () => {
  it('should calculate scavenge distribution correctly', () => {
    // Mock available troops
    const availableTroops = {
      spear: 328,
      sword: 540,
      axe: 0,
      light: 0,
      heavy: 0
    };

    // Mock unit carrying capacity
    const unitCarryCapacity: UnitCarryCapacity = {
      spear: 25,
      sword: 15,
      axe: 10,
      light: 80,
      heavy: 50
    };

    // Mock loot constants
    const lootConstants: LootConstants = {
      "LL": {
        loot_factor: 0.1,
        duration_exponent: 0.45,
        duration_initial_seconds: 1800,
        duration_factor: 0.8845,
        SS: {
          loot_factor: 1.2
        }
      },
      "HH": {
        loot_factor: 0.25,
        duration_exponent: 0.45,
        duration_initial_seconds: 1800,
        duration_factor: 0.8845,
        SS: {
          loot_factor: 1.2
        }
      },
      "CC": {
        loot_factor: 0.5,
        duration_exponent: 0.45,
        duration_initial_seconds: 1800,
        duration_factor: 0.8845,
        SS: {
          loot_factor: 1.2
        }
      },
      "GG": {
        loot_factor: 0.75,
        duration_exponent: 0.45,
        duration_initial_seconds: 1800,
        duration_factor: 0.8845,
        SS: {
          loot_factor: 1.2
        }
      }
    };

    // Set maximum level and premium status
    const maxLevel = 3; // 3 levels available (0, 1, 2)
    const isPremium = [true, true, true, false]; // Premium active for first 3 levels

    // Calculate scavenge distribution
    const result = calculateScavengeDistribution(
      availableTroops,
      unitCarryCapacity,
      lootConstants,
      maxLevel,
      isPremium
    );

    // Verify the result has the expected structure
    expect(result).toBeDefined();
    expect(result.unitDistribution).toBeDefined();
    expect(result.capacityDistribution).toBeDefined();
    expect(result.resourcesPerHour).toBeDefined();
    expect(result.totalCapacity).toBeGreaterThan(0);
    expect(result.totalResourcesPerHour).toBeGreaterThan(0);
    expect(result.unitSum).toBeDefined();

    // Verify dimensions of arrays
    expect(result.unitDistribution.length).toBe(maxLevel);
    expect(result.capacityDistribution.length).toBe(maxLevel);
    expect(result.resourcesPerHour.length).toBe(maxLevel);
    expect(result.unitSum.length).toBe(Object.keys(availableTroops).length);

    // Verify unit distribution sums match available troops
    for (let i = 0; i < Object.keys(availableTroops).length; i++) {
      const troopName = Object.keys(availableTroops)[i];
      const totalAllocated = result.unitSum[i];
      expect(totalAllocated).toBeLessThanOrEqual(availableTroops[troopName]);
    }

    // Log the result for inspection
    console.log(JSON.stringify(result, null, 2));
  });

  it('should handle empty troops correctly', () => {
    // Mock empty available troops
    const availableTroops = {
      spear: 0,
      sword: 0,
      axe: 0,
      light: 0,
      heavy: 0
    };

    // Mock unit carrying capacity
    const unitCarryCapacity: UnitCarryCapacity = {
      spear: 25,
      sword: 15,
      axe: 10,
      light: 80,
      heavy: 50
    };

    // Mock loot constants
    const lootConstants: LootConstants = {
      "LL": {
        loot_factor: 0.1,
        duration_exponent: 0.45,
        duration_initial_seconds: 1800,
        duration_factor: 0.8845,
        SS: {
          loot_factor: 1.2
        }
      },
      "HH": {
        loot_factor: 0.25,
        duration_exponent: 0.45,
        duration_initial_seconds: 1800,
        duration_factor: 0.8845,
        SS: {
          loot_factor: 1.2
        }
      },
      "CC": {
        loot_factor: 0.5,
        duration_exponent: 0.45,
        duration_initial_seconds: 1800,
        duration_factor: 0.8845,
        SS: {
          loot_factor: 1.2
        }
      },
      "GG": {
        loot_factor: 0.75,
        duration_exponent: 0.45,
        duration_initial_seconds: 1800,
        duration_factor: 0.8845,
        SS: {
          loot_factor: 1.2
        }
      }
    };

    // Set maximum level and premium status
    const maxLevel = 3; // 3 levels available (0, 1, 2)
    const isPremium = [false, false, false, false]; // No premium active

    // Calculate scavenge distribution
    const result = calculateScavengeDistribution(
      availableTroops,
      unitCarryCapacity,
      lootConstants,
      maxLevel,
      isPremium
    );

    // Verify the result has the expected structure
    expect(result).toBeDefined();
    expect(result.totalCapacity).toBe(0);
    expect(result.totalResourcesPerHour).toBe(0);

    // Log the result for inspection
    console.log(JSON.stringify(result, null, 2));
  });
});