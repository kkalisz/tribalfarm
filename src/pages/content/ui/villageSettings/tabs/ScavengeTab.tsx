import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  FormControl,
} from '@chakra-ui/react';
import TribalText from "@src/shared/ui/TribalText";
import TribalCheckbox from "@src/shared/ui/TribalCheckbox";
import TribalFormLabel from "@src/shared/ui/TribalFormLabel";
import TribalSelect from "@src/shared/ui/TribalSelect";
import TribalButton from "@src/shared/ui/TribalButton";
import { BaseVillageInfo } from "@src/shared/models/game/BaseVillageInfo";
import { ScavengeSettings } from "@src/shared/models/game/ScavengeSettings";
import { ScavengeCalculationMode } from "@src/shared/actions/backend/scavenge/calculateScavenge";
import TroopCountsForm from "@pages/content/ui/TroopCountsForm";
import { useAsync } from "@src/shared/hooks/useAsync";
import { useGameDatabase } from "@src/shared/contexts/StorageContext";
import {TroopsCount} from "@src/shared/models/game/TroopCount";
import {TroopName} from "@src/shared/models/game/Troop";
import {useActionExecutorContext} from '@src/shared/contexts/ActionExecutorContext';
import {SCAVENGE_VILLAGE_ACTION} from '@src/shared/actions/backend/scavenge/ScavengeVillageAction';
import {StartScavengeActionInput} from '@src/shared/actions/backend/scavenge/scavengeVillage';

const troopsToHide: TroopName[] = [
  "noble",
  "ram",
  "catapult",
  "militia",
  "scout"
]

interface ScavengeTabProps {
  village: BaseVillageInfo;
}

export const ScavengeTab: React.FC<ScavengeTabProps> = ({ village }) => {
  const gameDatabase = useGameDatabase();
  const actionExecutor = useActionExecutorContext();

  // State for form fields
  const [enabled, setEnabled] = useState(false);
  const [calculationMode, setCalculationMode] = useState<ScavengeCalculationMode>(
    ScavengeCalculationMode.MAX_RESOURCES_PER_RUN
  );
  const [troopsLimit, setTroopsLimit] = useState<TroopsCount>({});
  const [troopsExcluded, setTroopsExcluded] = useState<TroopsCount>({});

  // Fetch current settings
  const { loading, error, data: settings, execute: refreshSettings } = useAsync(
    () => gameDatabase.scavengeDb.getScavengeSettings(village.villageId),
    [village.villageId]
  );

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled);
      setCalculationMode(settings.calculationMode);
      setTroopsLimit(settings.troopsLimit || {});
      setTroopsExcluded(settings.troopsExcluded || {});
    }
  }, [settings]);

  // Save settings
  const handleSave = async () => {
      const newSettings: ScavengeSettings = {
        villageId: village.villageId,
        enabled,
        calculationMode,
        troopsLimit,
        troopsExcluded
      };

      await gameDatabase.scavengeDb.saveScavengeSettings(newSettings);
      if(newSettings.enabled){
        actionExecutor.sendUiActionRequest<StartScavengeActionInput>({
          type: SCAVENGE_VILLAGE_ACTION,
          parameters: {
            villageId: village.villageId,
            addRepeatScavengeTimer: true,
          }
        })
      }
      await refreshSettings();
  };

  if(loading){
    return null;
  }

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {loading && <TribalText>Loading settings...</TribalText>}
        {error && <TribalText color="red.500">Error loading settings: {error.message}</TribalText>}

        <HStack spacing={4} justify="space-between" width="100%">
          <FormControl display="flex" alignItems="center" width="auto">
            <TribalFormLabel htmlFor="scavenge-enabled" mb="0" mr={2}>
              Enable Scavenge
            </TribalFormLabel>
            <TribalCheckbox 
              id="scavenge-enabled" 
              isChecked={enabled} 
              onChange={(e) => setEnabled(e.target.checked)}
            />
          </FormControl>

          <FormControl width="auto" flex="1">
            <TribalSelect
              placeholder="Calculation Mode"
              id="calculation-mode" 
              value={calculationMode} 
              onChange={(e) => setCalculationMode(Number(e.target.value) as ScavengeCalculationMode)}
            >
              <option value={ScavengeCalculationMode.MAX_RESOURCES_PER_RUN}>
                Max Resources Per Run
              </option>
              <option value={ScavengeCalculationMode.SAME_RETURN_TIME}>
                Same Return Time
              </option>
              <option value={ScavengeCalculationMode.MAX_RESOURCES_PER_HOUR}>
                Max Resources Per Hour
              </option>
            </TribalSelect>
          </FormControl>

          <TribalButton variant="primary" onClick={handleSave}>
            Save Settings
          </TribalButton>
        </HStack>
        <HStack spacing={4} align="start">
          <Box>
            <TroopCountsForm
              initialCounts={troopsLimit}
              onChange={setTroopsLimit}
              title="Limit"
              helpText="Limit the number of troops that can be scavenged per run."
              troopsToHide={troopsToHide}
            />
          </Box>
          <Box>
            <TroopCountsForm
              initialCounts={troopsExcluded}
              onChange={setTroopsExcluded}
              title="Excluded"
              helpText="Troops that will never be used for scavenging."
              troopsToHide={troopsToHide}
            />
          </Box>
        </HStack>

      </VStack>
    </Box>
  );
};
