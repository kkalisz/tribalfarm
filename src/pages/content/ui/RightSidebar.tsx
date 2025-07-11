import React, {useState} from "react";
import {Box, Flex, Text} from "@chakra-ui/react";
import {SidebarToggleButton} from "@pages/content/ui/SidebarToggleButton";
import TribalCard from "@src/shared/ui/TribalCard";
import {VillageSelector} from "@src/shared/ui/VillageSelector/VillageSelector";
import {BaseVillageInfo} from "@src/shared/models/game/BaseVillageInfo";
import {SettingsContainer} from "@pages/content/ui/SettingsContainer";

interface RightSidebarProps {
  rightSidebarVisible: boolean;
  setRightSidebarVisible: (visible: boolean) => Promise<void>;
  logs: string[];
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  rightSidebarVisible,
  setRightSidebarVisible,
  logs
}) => {

  // State for villages
  const [selectedVillage, setSelectedVillage] = useState<BaseVillageInfo | null>();
  return (
    <Box
      pointerEvents={rightSidebarVisible ? "auto" : "none"}
      position="fixed"
      top="0"
      right="4"
      height="100vh"
      width="50%"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Flex p={2} justifyContent="flex-end" pointerEvents="none">
        <SidebarToggleButton
          isVisible={rightSidebarVisible}
          onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
          position="right"
        />
      </Flex>

      {/* Sidebar Content - Completely hidden when not visible */}
      {rightSidebarVisible && (
        <Box
          flex="1"
          pointerEvents="auto"
          height="100%"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <TribalCard
            title="Settings"
            style={{ 
              height: "100%", 
              display: "flex", 
              flexDirection: "column"
            }}
          >
            <SettingsContainer isOpen={rightSidebarVisible}/>
          </TribalCard>
        </Box>
      )}
    </Box>
  );
};
