import axios from 'axios';
import {XMLParser} from 'fast-xml-parser';
import {WorldConfig} from "@src/shared/models/game/WorldConfig";

async function fetchWorldConfig(serverUrl: string): Promise<WorldConfig> {
  try {
    // Fetch the XML data
    const response = await axios.get(`https://${serverUrl}/interface.php?func=get_config`, {
      headers: { 'Content-Type': 'application/xml' },
    });

    // Parse the XML string into a JavaScript object using fast-xml-parser
    const parser = new XMLParser({
      ignoreAttributes: false, // Keep attributes if there are any
      attributeNamePrefix: '', // No prefixes for attributes
    });

    const jsonObject = parser.parse(response.data);

    // The `jsonObject` now contains the entire parsed XML as a JavaScript object.
    // In this case, the "root" element is <config>, so we get it directly.
    return jsonObject.config;
  } catch (error) {
    console.error('Error fetching or parsing the config:', error);
    throw new Error('Failed to fetch or parse config');
  }
}