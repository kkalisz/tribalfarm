import React from "react";
import {Box, Flex, Text} from "@chakra-ui/react";
import {SidebarToggleButton} from "@pages/content/ui/SidebarToggleButton";
import TribalCard from "@src/shared/ui/TribalCard";

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
          height="100%"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <TribalCard 
            title="Logs" 
            style={{ 
              height: "100%", 
              display: "flex", 
              flexDirection: "column"
            }}
          >
            <Box 
              fontSize="sm"
              flex="1" 
              overflowY="auto" 
              overflowX="hidden" 
              height="100%"
            >
              {logs.map((log, index) => (
                <Text key={index}>{log}</Text>
              ))}
            </Box>
          </TribalCard>
        </Box>
      )}
    </Box>
  );
};
