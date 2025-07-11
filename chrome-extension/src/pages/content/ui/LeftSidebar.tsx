import React, {useCallback, useState, useEffect} from "react";
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
import {SCAVENGE_VILLAGE_ACTION} from "@src/shared/actions/backend/scavenge/ScavengeVillageAction";
import {playSound} from "@pages/content/helpers/playSound";
import { useActionExecutorContext } from '@src/shared/contexts/ActionExecutorContext';
import { useStateManagerField } from '@pages/content/hooks/useStateManagerField';
import BlinkingButton from '@pages/content/ui/components/BlinkingButton';
import {TribalTabPanel} from "@src/shared/ui/TribalTabs";
import {SettingsSwitch} from "@src/shared/SettingsSwitch";
import { VillageSelector } from '@src/shared/ui/VillageSelector';
import { UserVillageResponse } from '@src/shared/models/actions/GetUserVillagesAction';
import { useGameDatabase } from '@src/shared/contexts/StorageContext';
import { VillageOverview } from '@src/shared/models/game/BaseVillageInfo';

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
  const executor = useActionExecutorContext();
  const [isPaused, setPaused] = useStateManagerField(executor.stateManager, "paused")
  const gameUrlInfo = executor.contentPageContext.gameUrlInfo
  const gameDatabase = useGameDatabase();

  // State for villages
  const [villages, setVillages] = useState<UserVillageResponse[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<UserVillageResponse | undefined>();
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);
  const [villageError, setVillageError] = useState<string | undefined>();

  // Fetch villages on component mount
  useEffect(() => {
    fetchVillages();
  }, []);

  // Function to fetch villages
  const fetchVillages = async () => {
    setIsLoadingVillages(true);
    setVillageError(undefined);

    try {
      // Get villages from the database
      const villageOverviews = await gameDatabase.settingDb.getAllVillageOverviews();

      // Map VillageOverview objects to UserVillageResponse objects
      const mappedVillages: UserVillageResponse[] = villageOverviews.map(village => ({
        villageId: village.villageId,
        villageName: village.name,
        coordinates: village.coordinates
      }));

      setVillages(mappedVillages);

      // If there are villages and no selected village, select the first one
      if (mappedVillages.length > 0 && !selectedVillage) {
        setSelectedVillage(mappedVillages[0]);
      }

      setIsLoadingVillages(false);
    } catch (error) {
      setVillageError("Error fetching villages: " + (error instanceof Error ? error.message : String(error)));
      setIsLoadingVillages(false);
    }
  };

  // Function to handle village selection
  const handleSelectVillage = (village: UserVillageResponse) => {
    setSelectedVillage(village);

    // Send message to background script to switch village
    chrome.runtime.sendMessage({
      type: "ui_action",
      fullDomain: gameUrlInfo.fullDomain,
      payload: {
        action: 'switchVillage',
        parameters: {
          villageId: village.villageId,
          villageName: village.villageName
        },
      },
    });
  };

  // Function to select current village
  const handleSelectCurrentVillage = () => {
    // Get current village ID from game URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentVillageId = urlParams.get('village');

    if (currentVillageId) {
      const village = villages.find(v => v.villageId === currentVillageId);
      if (village) {
        setSelectedVillage(village);
      }
    }
  };

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
        { isPaused && <BlinkingButton isBlinking pointerEvents="auto" onClick={() => setPaused(false)}>PAUSED</BlinkingButton>}
      </Flex>


      {/* Sidebar Content - Completely hidden when not visible */}
      {leftSidebarVisible && (
        <TribalCard
          contentPadding={1}
          noBorder={true}
          style={{
            height: "fit-content",
            overflowY: "hidden",
            pointerEvents: "auto",
          }}
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
            <TribalCard variant={"secondary"}>
              <SettingsSwitch onChange={() => {}} label={'Enable plugin'} name={'settings-enabled'} enabled={true}/>
              <SettingsSwitch onChange={() => {}} label={'Show gui'} name={'settings-gui'} enabled={false}/>
            </TribalCard>
          <TribalCard variant="secondary" style={{ padding:"2px"}}>
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
            {currentCommand && (
              <Box mt={2}>
                <Text><strong>Current Command:</strong></Text>
                <Text>Action: {currentCommand.payload.action}</Text>
                <Text>ID: {currentCommand.actionId}</Text>
              </Box>
            )}
          </TribalCard>
          <TribalButton onClick={() => {
            playSound();
          }}>
            Play
          </TribalButton>

          {/* Village Selector Component */}
          <VillageSelector
            villages={villages}
            selectedVillage={selectedVillage}
            onSelectVillage={handleSelectVillage}
            onSelectCurrentVillage={handleSelectCurrentVillage}
            isLoading={isLoadingVillages}
            error={villageError}
          />

          <TroopCountsForm onChange={onChangeUnits} availableTroops={{
            spear: 9999,
            axe: 9999,
          }}/>
        </TribalCard>
      )}
    </Box>
  );
};
