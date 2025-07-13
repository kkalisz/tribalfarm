import React, { useState, useEffect } from "react";
import { 
  Box, 
  VStack, 
  HStack, 
  FormControl, 
  useToast
} from "@chakra-ui/react";
import TribalText from "@src/shared/ui/TribalText";
import TribalCheckbox from "@src/shared/ui/TribalCheckbox";
import TribalFormLabel from "@src/shared/ui/TribalFormLabel";
import TribalSelect from "@src/shared/ui/TribalSelect";
import TribalButton from "@src/shared/ui/TribalButton";
import { BaseVillageInfo } from "@src/shared/models/game/BaseVillageInfo";
import { ScavengeSettings } from "@src/shared/models/game/ScavengeSettings";
import { ScavengeCalculationMode } from "@src/shared/actions/backend/scavenge/calculateScavenge";
import TroopCountsForm from "@src/pages/content/ui/TroopCountsForm";
import { useAsync } from "@src/shared/hooks/useAsync";
import { useGameDatabase } from "@src/shared/contexts/StorageContext";
import {TroopsCount} from "@src/shared/models/game/TroopCount";

interface ScavengeTabProps {
  village: BaseVillageInfo;
}

export const ScavengeTab: React.FC<ScavengeTabProps> = ({ village }) => {
  const gameDatabase = useGameDatabase();
  const toast = useToast();

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
    try {
      const newSettings: ScavengeSettings = {
        villageId: village.villageId,
        enabled,
        calculationMode,
        troopsLimit,
        troopsExcluded
      };

      await gameDatabase.scavengeDb.saveScavengeSettings(newSettings);
      await refreshSettings();

      toast({
        title: "Settings saved",
        description: "Scavenge settings have been saved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error saving settings",
        description: "There was an error saving your scavenge settings.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Error saving scavenge settings:", err);
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {loading && <TribalText>Loading settings...</TribalText>}
        {error && <TribalText color="red.500">Error loading settings: {error.message}</TribalText>}

        <FormControl display="flex" alignItems="center">
          <TribalFormLabel htmlFor="scavenge-enabled" mb="0">
            Enable Scavenge
          </TribalFormLabel>
          <TribalCheckbox 
            id="scavenge-enabled" 
            isChecked={enabled} 
            onChange={(e) => setEnabled(e.target.checked)}
          />
        </FormControl>

        <FormControl>
          <TribalFormLabel htmlFor="calculation-mode">Calculation Mode</TribalFormLabel>
          <TribalSelect 
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

        <HStack spacing={4} align="start">
          <Box>
            <TribalText mb={2}>Troops Limit (Max troops to be used)</TribalText>
            <TroopCountsForm
              initialCounts={troopsLimit}
              onChange={setTroopsLimit}
              title="Troops Limit"
            />
          </Box>

          <Box>
            <TribalText mb={2}>Troops Excluded (Can't be used)</TribalText>
            <TroopCountsForm
              initialCounts={troopsExcluded}
              onChange={setTroopsExcluded}
              title="Troops Excluded"
            />
          </Box>
        </HStack>

        <TribalButton variant="primary" onClick={handleSave}>
          Save Settings
        </TribalButton>
      </VStack>
    </Box>
  );
};
