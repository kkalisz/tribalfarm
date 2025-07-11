import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { BaseVillageInfo } from "@src/shared/models/game/BaseVillageInfo";

interface FarmingTabProps {
  village: BaseVillageInfo;
}

export const FarmingTab: React.FC<FarmingTabProps> = ({ village }) => {
  return (
    <Box>
      <Text>Farming settings for village: {village.name}</Text>
      {/* Farming-specific settings will go here */}
    </Box>
  );
};