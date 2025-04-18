import React from "react";
import {CommandMessage} from "@src/shared/types";
import {SidebarToggleButton} from "./SidebarToggleButton";
import {Box, Flex, Heading, Text} from "@chakra-ui/react";
import TribalCard from "@src/shared/ui/TribalCard";

interface LeftSidebarProps {
  leftSidebarVisible: boolean;
  setLeftSidebarVisible: (visible: boolean) => Promise<void>;
  commandStatus: string;
  currentCommand: CommandMessage | null;
  lastEvent: string;
}

export const LeftSidebar = ({
                              leftSidebarVisible,
                              setLeftSidebarVisible,
                              commandStatus,
                              currentCommand,
                              lastEvent
                            }: LeftSidebarProps) => {
  return (
    <Box
      position="fixed"
      height="full"
      top="0"
      left="0"
      width="25%"
    >
      <Flex p={2} justifyContent="flex-start" pointerEvents="none">
        <SidebarToggleButton
          isVisible={leftSidebarVisible}
          onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
          position="left"
        />
      </Flex>


      {/* Sidebar Content - Completely hidden when not visible */}
      {leftSidebarVisible && (
        <Box
          height="fit-content"
          overflowY="hidden"
          pointerEvents="auto"
        >
          <TribalCard title="Status`">
              {currentCommand && (
                <Box mt={2}>
                  <Text><strong>Current Command:</strong></Text>
                  <Text>Action: {currentCommand.payload.action}</Text>
                  <Text>ID: {currentCommand.actionId}</Text>
                </Box>
              )}
              {lastEvent && (
                <Text mt={2}><strong>Last Event:</strong> {lastEvent}</Text>
              )}
          </TribalCard>
        </Box>
      )}
    </Box>
  );
};
