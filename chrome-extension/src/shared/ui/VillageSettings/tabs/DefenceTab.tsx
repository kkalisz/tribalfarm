import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { BaseVillageInfo } from "@src/shared/models/game/BaseVillageInfo";

interface DefenceTabProps {
  village: BaseVillageInfo;
}

export const DefenceTab: React.FC<DefenceTabProps> = ({ village }) => {
  return (
    <Box>
      <Text>Defence settings for village: {village.name}</Text>
      {/* Defence-specific settings will go here */}
    </Box>
  );
};