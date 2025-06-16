import React, {useCallback} from "react";
import {CommandMessage} from "@src/shared/actions/content/core/types";
import {SidebarToggleButton} from "./SidebarToggleButton";
import {Box, Flex, Text, FormControl, FormLabel} from "@chakra-ui/react";
import TribalCard from "@src/shared/ui/TribalCard";
import TribalButton from "@src/shared/ui/TribalButton";
import {useFeatureSettings} from "@src/shared/hooks/useFeatureSettings";
import TribalSwitch from "@src/shared/ui/TribalSwitch";
import TribalText from "@src/shared/ui/TribalText";
import TroopCountsForm from "@pages/content/ui/TroopCountsForm";
import {TroopsCount} from "@src/shared/models/game/TroopCount";
import {usePlayerContext} from "@src/shared/contexts/PlayerContext";
import {SCAVENGE_VILLAGE_ACTION} from "@src/shared/actions/backend/scavenge/ScavengeVillageAction";

interface LeftSidebarProps {
  leftSidebarVisible: boolean;
  setLeftSidebarVisible: (visible: boolean) => Promise<void>;
  currentCommand: CommandMessage | null;
}

export const LeftSidebar = ({
  leftSidebarVisible,
  setLeftSidebarVisible,
  currentCommand,
}: LeftSidebarProps) => {
  // Use the feature settings hook to get and set the autoScavenge setting
  const {autoScavenge} = useFeatureSettings();
  const { gameUrlInfo } = usePlayerContext();

  const onChangeUnits = useCallback((value: TroopsCount) => {
  }, [])

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
                type: "ui_action",
                fullDomain: gameUrlInfo.fullDomain,
                payload: {
                  action: SCAVENGE_VILLAGE_ACTION,
                  parameters: {
                    addRepeatScavengeTimer: false,
                  },
                },
              });
            }}>
              Test Navigate
            </TribalButton>
            <TribalButton onClick={() => {
              chrome.runtime.sendMessage({
                type: "ui_action",
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
          </TribalCard>
          <TroopCountsForm onChange={onChangeUnits} availableTroops={{
            spear: 9999,
            axe: 9999,
          }}/>
        </Box>
      )}
    </Box>
  );
};
