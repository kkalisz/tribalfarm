import React, {useEffect, useState} from "react";
import {Box, Flex} from "@chakra-ui/react";
import {VillageSelector} from "@src/shared/ui/VillageSelector/VillageSelector";
import {BaseVillageInfo} from "@src/shared/models/game/BaseVillageInfo";
import TribalButton from "@src/shared/ui/TribalButton";
import {useQueryParams} from "@src/shared/hooks/useQueryParams";
import {useAsync} from "@src/shared/hooks/useAsync";
import {useGameDatabase} from "@src/shared/contexts/StorageContext";
import findVillageById from "@src/shared/models/helpers/findVillageById";
import {VillageSettings} from "@src/shared/ui/VillageSettings";

interface SettingsContainerProps {
  isOpen: boolean;
}

export const SettingsContainer: React.FC<SettingsContainerProps> = ({
                                                                      isOpen
}) => {
  const gameDatabase = useGameDatabase();

  const { data: villages } = useAsync(() => {
    return gameDatabase.accountDb.getAllVillageOverviews();
  })

  // State for villages
  const [selectedVillage, setSelectedVillage] = useState<BaseVillageInfo | null>();

  // Get query parameters using direct destructuring
  const { village: currentUrlVillage } = useQueryParams();

  console.log(currentUrlVillage);

  // Handler for current location button
  const handleCurrentLocation = () => {
    if(currentUrlVillage && villages) {
      setSelectedVillage(findVillageById(villages,currentUrlVillage));
    }
  };

  useEffect(() => {
    if(selectedVillage) return;
    handleCurrentLocation();
  }, [currentUrlVillage, villages]);

  // Handler for save button (empty implementation as per requirements)
  const handleSave = () => {
    // Empty implementation as per requirements
  };

  return (
    <>
      <Flex alignItems="flex-end" width="100%">
        <Box flex="1">
          <VillageSelector
            selectedVillageId={selectedVillage?.villageId}
            onSelectVillage={setSelectedVillage}
          />
        </Box>
        <Flex ml={2}>
          <TribalButton
            variant="primary"
            onClick={handleCurrentLocation}
            mr={1}
          >
            Current village
          </TribalButton>
          <TribalButton
            variant="primary" 
            size="sm"
            onClick={handleSave}
          >
            Save
          </TribalButton>
        </Flex>
      </Flex>
      {selectedVillage && (
        <VillageSettings village={selectedVillage} />
      )}
    </>
  );
};
