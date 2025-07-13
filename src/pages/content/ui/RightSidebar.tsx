import React from "react";
import {Box, Flex} from "@chakra-ui/react";
import {SidebarToggleButton} from "@pages/content/ui/SidebarToggleButton";
import TribalCard from "@src/shared/ui/TribalCard";
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
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <TribalCard
            title="Settings"
            style={{
              overflowY: "visible",
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
