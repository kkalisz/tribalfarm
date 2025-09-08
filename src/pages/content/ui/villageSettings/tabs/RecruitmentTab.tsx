import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { BaseVillageInfo } from "@src/shared/models/game/BaseVillageInfo";

interface RecruitmentTabProps {
  village: BaseVillageInfo;
}

export const RecruitmentTab: React.FC<RecruitmentTabProps> = ({ village }) => {
  return (
    <Box>
      <Text>Recruitment settings for village: {village.name}</Text>
      {/* Recruitment-specific settings will go here */}
    </Box>
  );
};