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
      position="fixed"
      top="0"
      right="0"
      height="full"
      width="25%"
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
          height="fit-content"
          overflowY="hidden"
          pointerEvents="auto"
        >
          <TribalCard title="Logs">
            <Box mt={2} fontSize="sm">
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
