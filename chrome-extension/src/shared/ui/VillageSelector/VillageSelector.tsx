import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Input, 
  Flex, 
  Text, 
  FormControl, 
  FormLabel,
  InputGroup,
  InputLeftElement,
  Icon,
  Spinner
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import TribalCard from '@src/shared/ui/TribalCard';
import TribalButton from '@src/shared/ui/TribalButton';
import TribalSelect from '@src/shared/ui/TribalSelect';
import { VillageSelectorProps, VillageComponentProps } from './types';

export const VillageSelector: React.FC<VillageSelectorProps> = ({
  villages,
  selectedVillage,
  onSelectVillage,
  onSelectCurrentVillage,
  isLoading = false,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState<string | undefined>(
    selectedVillage?.villageId
  );

  // Update selected village ID when selectedVillage prop changes
  useEffect(() => {
    if (selectedVillage) {
      setSelectedVillageId(selectedVillage.villageId);
    }
  }, [selectedVillage]);

  // Filter villages based on search term
  const filteredVillages = useMemo(() => {
    if (!searchTerm.trim()) {
      return villages;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return villages.filter(village => 
      village.villageName.toLowerCase().includes(lowerSearchTerm) ||
      `${village.coordinates.x}|${village.coordinates.y}`.includes(lowerSearchTerm)
    );
  }, [villages, searchTerm]);

  // Handle village selection from dropdown
  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const villageId = e.target.value;
    setSelectedVillageId(villageId);
    
    const selectedVillage = villages.find(v => v.villageId === villageId);
    if (selectedVillage) {
      onSelectVillage(selectedVillage);
    }
  };

  return (
    <TribalCard title="Village Selection">
      <FormControl>
        <FormLabel htmlFor="village-search">Search Village</FormLabel>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={SearchIcon} color="tribal.primaryBorder" />
          </InputLeftElement>
          <Input
            id="village-search"
            placeholder="Search by name or coordinates"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="tribal.primaryBg"
            color="tribal.primaryText"
            borderColor="tribal.primaryBorder"
            _hover={{ borderColor: "tribal.accent" }}
            _focus={{ borderColor: "tribal.accent" }}
          />
        </InputGroup>
      </FormControl>

      <FormControl mt={3}>
        <FormLabel htmlFor="village-select">Select Village</FormLabel>
        {isLoading ? (
          <Flex justify="center" align="center" py={2}>
            <Spinner color="tribal.accent" />
          </Flex>
        ) : error ? (
          <Text color="red.500" fontSize="sm">{error}</Text>
        ) : (
          <TribalSelect
            id="village-select"
            value={selectedVillageId}
            onChange={handleVillageChange}
            placeholder="Choose a village"
          >
            {filteredVillages.map(village => (
              <option key={village.villageId} value={village.villageId}>
                {village.villageName} ({village.coordinates.x}|{village.coordinates.y})
              </option>
            ))}
          </TribalSelect>
        )}
      </FormControl>

      <Flex mt={3} justify="space-between">
        <TribalButton 
          onClick={onSelectCurrentVillage}
          isDisabled={isLoading || !onSelectCurrentVillage}
          size="sm"
        >
          Use Current Village
        </TribalButton>
      </Flex>

      {/* Container for village-specific components */}
      {selectedVillage && (
        <Box mt={4} p={3} bg="tribal.secondaryBg" borderRadius="md">
          <Text fontWeight="bold" mb={2}>
            Village: {selectedVillage.villageName} ({selectedVillage.coordinates.x}|{selectedVillage.coordinates.y})
          </Text>
          {/* This is where village-specific components will be rendered */}
          <Box>
            {/* Initially empty as per requirements */}
          </Box>
        </Box>
      )}
    </TribalCard>
  );
};

export const VillageComponent: React.FC<VillageComponentProps> = ({ village }) => {
  return (
    <Box>
      {/* This component will be used to display village-specific information */}
      <Text>Village ID: {village.villageId}</Text>
      <Text>Village Name: {village.villageName}</Text>
      <Text>Coordinates: ({village.coordinates.x}|{village.coordinates.y})</Text>
    </Box>
  );
};