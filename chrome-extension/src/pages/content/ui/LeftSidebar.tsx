import React from "react";
import {CommandMessage} from "@src/shared/actions/core/types";
import {SidebarToggleButton} from "./SidebarToggleButton";
import {Box, Flex, Switch, Text, FormControl, FormLabel} from "@chakra-ui/react";
import TribalCard from "@src/shared/ui/TribalCard";
import TribalButton from "@src/shared/ui/TribalButton";
import {useFeatureSettings} from "@src/shared/hooks/useFeatureSettings";
import TribalSwitch from "@src/shared/ui/TribalSwitch";
import TribalText from "@src/shared/ui/TribalText";

interface LeftSidebarProps {
  leftSidebarVisible: boolean;
  setLeftSidebarVisible: (visible: boolean) => Promise<void>;
  currentCommand: CommandMessage | null;
  lastEvent: string;
}

export const LeftSidebar = ({
                              leftSidebarVisible,
                              setLeftSidebarVisible,
                              currentCommand,
                              lastEvent
                            }: LeftSidebarProps) => {
  // Use the feature settings hook to get and set the autoScavenge setting
  const {autoScavenge} = useFeatureSettings();

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
          <TribalCard title="Features">
            <FormControl display="flex" alignItems="center" mt={2}>
              <FormLabel htmlFor="auto-scavenge" mb="0">
                Auto Scavenge
              </FormLabel>
              <TribalSwitch
                id="auto-scavenge"
                isChecked={autoScavenge.enabled}
                onChange={(e) => autoScavenge.setEnabled(e.target.checked)}
              />
            </FormControl>
            <TribalText fontSize="xs" mt={1}>
              Automatically scavenges resources every 5 minutes
            </TribalText>
          </TribalCard>

          <TribalCard title="Status">
            <TribalButton onClick={() => {
              chrome.runtime.sendMessage({
                type: "test",
                content: "test1",
              });
            }}>
              Test Navigate
            </TribalButton>
            <TribalButton onClick={() => {
              chrome.runtime.sendMessage({
                type: "test",
                content: "test2",
              });
            }}>
              Test Action
            </TribalButton>
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
