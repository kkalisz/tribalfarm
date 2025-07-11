import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { BaseVillageInfo } from "@src/shared/models/game/BaseVillageInfo";

interface ScavengeTabProps {
  village: BaseVillageInfo;
}

export const ScavengeTab: React.FC<ScavengeTabProps> = ({ village }) => {
  return (
    <Box>
      <Text>Scavenge settings for village: {village.name}</Text>
      {/* Scavenge-specific settings will go here */}
    </Box>
  );
};