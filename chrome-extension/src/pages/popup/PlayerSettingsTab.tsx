import React, { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { usePlayerSettings } from '@src/shared/hooks/usePlayerSettings';
import TribalInput from '@src/shared/ui/TribalInput';
import TribalButton from '@src/shared/ui/TribalButton';
import {SettingsStorageService} from "@src/shared/services/settingsStorage";

const PlayerSettingsTab: React.FC<{ settings: SettingsStorageService}> = ({settings}) => {
  const { playerSettings, setPlayerSettings } = usePlayerSettings(settings);
  const [errors, setErrors] = useState<Record<keyof typeof playerSettings, boolean>>({
    login: false,
    password: false,
    world: false,
    server: false
  });
  const [touched, setTouched] = useState<Record<keyof typeof playerSettings, boolean>>({
    login: false,
    password: false,
    world: false,
    server: false
  });

  const validateField = (field: keyof typeof playerSettings, value: string): boolean => {
    return value.trim() !== '';
  };

  const handleInputChange = (field: keyof typeof playerSettings) => (
    e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setPlayerSettings({
      ...playerSettings,
      [field]: value,
    });

    // Mark field as touched
    setTouched({
      ...touched,
      [field]: true
    });

    // Validate field
    setErrors({
      ...errors,
      [field]: !validateField(field, value)
    });
  };

  const handleSave = () => {
    // Check all fields
    const newErrors: Record<keyof typeof playerSettings, boolean> = {
      login: !validateField('login', playerSettings.login),
      password: !validateField('password', playerSettings.password),
      world: !validateField('world', playerSettings.world),
      server: !validateField('server', playerSettings.server)
    };

    setErrors(newErrors);

    // Mark all fields as touched
    setTouched({
      login: true,
      password: true,
      world: true,
      server: true
    });

    // If no errors, save settings
    if (!Object.values(newErrors).some(error => error)) {
      console.log('Player settings saved:', playerSettings);
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <TribalInput
          label="Login"
          placeholder="Enter your login"
          value={playerSettings.login}
          onChange={handleInputChange('login')}
          mb={3}
          isInvalid={errors.login && touched.login}
          errorMessage="Login is required"
        />
        <TribalInput
          label="Password"
          placeholder="Enter your password"
          type="password"
          value={playerSettings.password}
          onChange={handleInputChange('password')}
          mb={3}
          isInvalid={errors.password && touched.password}
          errorMessage="Password is required"
        />
        <TribalInput
          label="World"
          placeholder="Enter your world (e.g., en123)"
          value={playerSettings.world}
          onChange={handleInputChange('world')}
          mb={3}
          isInvalid={errors.world && touched.world}
          errorMessage="World is required"
        />
        <TribalInput
          label="Server"
          placeholder="Enter server domain (e.g., tribalwars.net)"
          value={playerSettings.server}
          onChange={handleInputChange('server')}
          mb={3}
          isInvalid={errors.server && touched.server}
          errorMessage="Server is required"
        />
      </Box>
      <Flex justifyContent="flex-end">
        <TribalButton onClick={handleSave}>
          Save Settings
        </TribalButton>
      </Flex>
    </Box>
  );
};

export default PlayerSettingsTab;
