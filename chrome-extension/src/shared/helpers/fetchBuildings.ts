import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import {Building, BuildingName} from '@src/shared/models/game/Building'; // Assume the Building type is where you defined it

export async function fetchBuildingInfo(serverUrl: string): Promise<Building[]> {
  try {
    // Fetch the XML data for building information
    const response = await axios.get(
      `https://${serverUrl}/interface.php?func=get_building_info`,
      {
        headers: { 'Content-Type': 'application/xml' },
      }
    );

    // Parse the XML string into a JavaScript object using fast-xml-parser
    const parser = new XMLParser({
      ignoreAttributes: false, // Keep attributes if there are any
      attributeNamePrefix: '', // No prefixes for attributes
    });

    const jsonObject = parser.parse(response.data);

    // Extract the buildings data from the <config> root element
    const buildingsData = jsonObject.config;

    // Convert the parsed object into an array of `Building` objects
    const buildings: Building[] = Object.entries(buildingsData).map(([key, value]: [string, any]) => ({
      name: key as BuildingName,
      maxLevel: parseInt(value.max_level),
      minLevel: parseInt(value.min_level),
      baseCost: {
        wood: parseInt(value.wood),
        stone: parseInt(value.stone),
        iron: parseInt(value.iron),
        pop: parseInt(value.pop),
      },
      costFactors: {
        woodFactor: parseFloat(value.wood_factor),
        stoneFactor: parseFloat(value.stone_factor),
        ironFactor: parseFloat(value.iron_factor),
        popFactor: parseFloat(value.pop_factor),
      },
      buildTime: parseInt(value.build_time),
      buildTimeFactor: parseFloat(value.build_time_factor),
    }));

    return buildings;
  } catch (error) {
    console.error('Error fetching or parsing the building info:', error);
    throw new Error('Failed to fetch or parse building info');
  }
}