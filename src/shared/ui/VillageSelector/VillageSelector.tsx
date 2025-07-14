import React from 'react';
import { 
  Box,
} from '@chakra-ui/react';
import {Nullable} from "vitest";
import {useAsync} from "@src/shared/hooks/useAsync";
import {useGameDatabase} from "@src/shared/contexts/StorageContext";
import {BaseVillageInfo } from "@src/shared/models/game/BaseVillageInfo";
import TribalText from "@src/shared/ui/TribalText";
import Autocomplete from "@src/shared/ui/Autocomplete/Autocomplete";
import {AutocompleteOption} from "@src/shared/ui/Autocomplete";
import {coordinatesToString} from "@src/shared/models/game/Coordinates";
import findVillageById from "@src/shared/models/helpers/findVillageById";

interface VillageSelectorProps {
  villages?: BaseVillageInfo[];
  selectedVillageId?: Nullable<string>
  onSelectVillage: (village: BaseVillageInfo | null) => void;
}

export const VillageSelector: React.FC<VillageSelectorProps> = ({
                                                                  selectedVillageId: defaultSelectedVillageId,
                                                                  onSelectVillage,
  villages: predefinedVillages,
}: VillageSelectorProps) => {
  const gameDatabase = useGameDatabase();

  const { data: dbVillages, loading } = useAsync(() => {
    return gameDatabase.accountDb.getAllVillageOverviews();
  }, [], !predefinedVillages)

  const villages = predefinedVillages ?? dbVillages;

  // Handle village selection from dropdown
  const handleVillageChange = (value: string, e?: AutocompleteOption) => {
    const villageId = e?.value
    if(!villageId){
      onSelectVillage(null);
      return;
    }
    const village = findVillageById(villages ?? [],villageId);
    onSelectVillage(village ?? null);
  };

  const options: AutocompleteOption[] = villages?.map((entry) =>  { return {
    value: entry.villageId,
    label: `${entry.name} ${coordinatesToString(entry.coordinates)}`
  }}) ?? []

  return (
    <Box>
       <TribalText>Select Village</TribalText>
       <Autocomplete isDisabled={loading} options={options} onChange={handleVillageChange} value={defaultSelectedVillageId ?? undefined}></Autocomplete>
    </Box>
  );
};
