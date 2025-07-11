import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { BaseVillageInfo } from "@src/shared/models/game/BaseVillageInfo";

interface BuildingTabProps {
  village: BaseVillageInfo;
}

export const BuildingTab: React.FC<BuildingTabProps> = ({ village }) => {
  return (
    <Box>
      <Text>Building settings for village: {village.name}</Text>
      {/* Building-specific settings will go here */}
    </Box>
  );
};