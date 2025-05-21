import React, {useState, useEffect, useCallback} from "react";
import { Box, Flex, Image } from "@chakra-ui/react";
import TribalCard from "@src/shared/ui/TribalCard";
import TribalInput from "@src/shared/ui/TribalInput";
import { AllTroops } from "@src/shared/models/game/Troops";
import { TroopName } from "@src/shared/models/game/Troop";

export interface TroopCounts {
  [troopType: string]: number;
}

interface TroopCountsFormProps {
  initialCounts?: TroopCounts;
  onChange: (counts: TroopCounts) => void;
  title?: string;
}

export const TroopCountsForm: React.FC<TroopCountsFormProps> = ({
  initialCounts = {},
  onChange,
  title = "Troop Counts"
}) => {
  const [counts, setCounts] = useState<TroopCounts>(initialCounts);

  // Update counts when initialCounts changes
  useEffect(() => {
    setCounts(initialCounts);
  }, []);

  const handleInputChange = useCallback( (troopName: TroopName, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value, 10);
    console.log(`new value ${numValue} ${isNaN(numValue)}`)
    if(counts[troopName] === numValue){
      return
    }
    const newCounts = {
      ...counts,
      [troopName]: isNaN(numValue) ? 0 : numValue
    };
    setCounts(newCounts);
    onChange(newCounts);
  },[]);

  console.log(JSON.stringify(counts))
  console.log(counts["spear"] || "");

  return (
    <TribalCard title={title}>
      <Box width="150px">
        {AllTroops.map((troop) => (
          <Flex 
            key={troop.name} 
            alignItems="center" 
            mb={2}
            justifyContent="space-between"
          >
              <Image
                src={`https://dspl.innogamescdn.com/asset/5b5cd/graphic/unit/unit_${troop.name}.png`} 
                alt={troop.name} 
                boxSize="24px" 
                mr={2}
              />
            <Box width="100px">
              <TribalInput
                //type="number"
                size="sm"
                value={counts[troop.name] ?? ""}
                onChange={(e) => handleInputChange(troop.name, e.target.value)}
                placeholder="0"
              />
            </Box>
          </Flex>
        ))}
      </Box>
    </TribalCard>
  );
};

export default TroopCountsForm;
