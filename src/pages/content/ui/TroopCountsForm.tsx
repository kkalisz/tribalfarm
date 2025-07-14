import React, {useState, useCallback, useEffect} from "react";
import { Box, Flex, Image } from "@chakra-ui/react";
import TribalCard from "@src/shared/ui/TribalCard";
import TribalInput from "@src/shared/ui/TribalInput";
import {AllTroopNames, TroopName} from "@src/shared/models/game/Troop";
import {TroopsCount} from "@src/shared/models/game/TroopCount";
import TribalLink from "@src/shared/ui/TribalLink";


interface TroopCountsFormProps {
  initialCounts?: TroopsCount;
  onChange: (counts: TroopsCount) => void;
  title?: string;
  availableTroops?: TroopsCount;
  troopsToHide?: TroopName[];
  troopsToShow?: TroopName[];
}

export const TroopCountsForm: React.FC<TroopCountsFormProps> = ({
  initialCounts = {},
  onChange,
  title = "Troop Counts",
  availableTroops,
  troopsToHide = [],
  troopsToShow = []
}) => {
  const [counts, setCounts] = useState<TroopsCount>(initialCounts);

  // Update counts when initialCounts changes
  useEffect(() => {
    // Create a copy of initialCounts
    const newCounts = { ...initialCounts };

    // Ensure troops in troopsToHide have a value of 0
    troopsToHide.forEach(troopName => {
      newCounts[troopName] = 0;
    });

    setCounts(newCounts);
  }, [initialCounts, troopsToHide, troopsToShow]);

  const handleInputChange = useCallback((troopName: TroopName, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value, 10);
    console.log(`new value ${numValue} ${isNaN(numValue)}`)
    if(counts[troopName] === numValue){
      return
    }
    const newCounts = {
      ...counts,
      [troopName]: isNaN(numValue) ? 0 : numValue
    };

    // Ensure troops in troopsToHide have a value of 0
    troopsToHide.forEach(troopName => {
      newCounts[troopName] = 0;
    });

    setCounts(newCounts);
    onChange(newCounts);
  }, [counts, onChange, troopsToHide, troopsToShow]);

  // Calculate available troops for a specific troop type
  const getAvailableTroops = useCallback((troopName: TroopName) => {
    const available = availableTroops?.[troopName] ?? 0;
    const current = counts[troopName] ?? 0;
    return Math.max(0, available - current);
  }, [availableTroops, counts]);

  // Handle clicking on the available troops counter
  const handleCounterClick = useCallback((troopName: TroopName) => {
    const available = getAvailableTroops(troopName);
    //if (available > 0) {
      const current = counts[troopName] || 0;
      const newValue = available === 0 ? 0 :current + available;
      const newCounts = {
        ...counts,
        [troopName]: newValue
      };
      setCounts(newCounts);
      onChange(newCounts);
    //}
  }, [counts, getAvailableTroops, onChange]);


  // Determine which troops to show based on troopsToShow and troopsToHide
  const visibleTroops = (troopsToShow.length > 0 ? troopsToShow : AllTroopNames)
    .filter(name => !troopsToHide.includes(name));

  const width = availableTroops ? "140px" : "90px";

  return (
    <TribalCard title={title}>
      <Box width={width}>
        {visibleTroops.map((name) => (
          <Flex 
            key={name} 
            alignItems="center" 
            mb={1}
            justifyContent="space-between"
          >
            <Image
              src={`https://dspl.innogamescdn.com/asset/5b5cd/graphic/unit/unit_${name}.png`} 
              alt={name} 
              boxSize="20px" 
              mr={1}
            />
            <Flex alignItems="center" gap={2} width="100%" justifyContent="start">
              <Box width="50px" mr={1}>
                <TribalInput
                  size="xs"
                  value={counts[name] === 0 ? "" : counts[name]}
                  onChange={(e) => handleInputChange(name, e.target.value)}
                />
              </Box>
              {availableTroops?.[name] !== undefined && (
                <TribalLink
                  onClick={() => handleCounterClick(name)}
                  textAlign="left"
                  sx={{
                    px: 1,
                    lineHeight: 1, // This reduces the vertical space
                    margin: 0, // Ensures there’s no margin applied
                    padding: 0,
                    ml: 1// Ensures no additional paddings
                  }}
                >
                  {`(${getAvailableTroops(name)})`}
                </TribalLink>
              )}
            </Flex>
          </Flex>
        ))}
      </Box>
    </TribalCard>
  );
};

export default TroopCountsForm;
