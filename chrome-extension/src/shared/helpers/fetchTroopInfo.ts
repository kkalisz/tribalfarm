import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import {Troop, TroopName, troopStaticCosts} from "@src/shared/models/game/Troop";

export async function fetchTroopInfo(serverUrl: string): Promise<Troop[]> {
  try {
    // Fetch the XML data for troop information
    const response = await axios.get(
      `https://${serverUrl}/interface.php?func=get_unit_info`,
      {
        headers: { 'Content-Type': 'application/xml' },
      }
    );

    // Parse the XML string into a JavaScript object
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '', // No prefixes for attributes
    });

    const jsonObject = parser.parse(response.data);

    // Extract the troop data from the <config> root element
    const troopData = jsonObject.config;

    // Mapping XML troop names to your existing TroopName type
    const troopNameMapping: Record<string, TroopName> = {
      spear: 'spear',
      sword: 'sword',
      axe: 'axe',
      archer: 'archer',
      spy: 'scout',
      light: 'light',
      marcher: 'marcher',
      heavy: 'heavy',
      ram: 'ram',
      catapult: 'catapult',
      knight: 'knight',
      snob: 'noble',
      militia: 'militia', // Now included
    };

    // Convert each troop entry into a Troop object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const troops: Troop[] = Object.entries(troopData).map(([key, value]: [string, any]) => {
      const aliasName = key; // Original name from XML
      const troopName = troopNameMapping[key] ?? key;// Map XML name to TroopName

      // Extract population cost from XML and merge with static costs
      const pop = parseInt(value.pop); // Population cost from XML
      const staticCost = troopStaticCosts[troopName] || { wood: 0, stone: 0, iron: 0 };

      return {
        name: troopName, // Mapped name from TroopName
        aliasName, // Original name in XML
        cost: {
          ...staticCost,
          pop, // Include population cost dynamically
        },
        buildTime: parseInt(value.build_time),
        speed: parseFloat(value.speed),
        attack: parseInt(value.attack),
        defense: {
          infantry: parseInt(value.defense),
          cavalry: parseInt(value.defense_cavalry),
          archer: parseInt(value.defense_archer),
        },
        lootCapacity: parseInt(value.carry),
      };
    });

    return troops.filter((troop): troop is Troop => !!troop); // Remove undefined troops
  } catch (error) {
    console.error('Error fetching or parsing the troop info:', error);
    throw new Error('Failed to fetch or parse troop info');
  }
}