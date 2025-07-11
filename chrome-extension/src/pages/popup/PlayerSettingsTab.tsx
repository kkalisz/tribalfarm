import React, {useEffect, useState} from 'react';
import { Box, Flex } from '@chakra-ui/react';
import {PlayerSettings} from '@src/shared/hooks/usePlayerSettings';
import TribalInput from '@src/shared/ui/TribalInput';
import TribalButton from '@src/shared/ui/TribalButton';
import {useGameDatabase} from "@src/shared/contexts/StorageContext";
import {useAsync} from "@src/shared/hooks/useAsync";
import {GameUrlInfo} from "@src/shared/helpers/getGameUrlInfo";

interface PlayerSettingsTabProps {
  gameUrlInfo: GameUrlInfo;
}

const PlayerSettingsTab: React.FC<PlayerSettingsTabProps> = ({ gameUrlInfo }) => {

  const gameDatabase = useGameDatabase();


  const defaultPlayerSettings: PlayerSettings = {
    login: '',
    password: '',
    world: gameUrlInfo.subdomain ?? "",
    server: gameUrlInfo.fullDomain ?? ""
  }
  const { loading, error, data: playerSettingsRaw, execute } = useAsync(() => gameDatabase.settingDb.getPlayerSettings(), []);

  const [ playerSettings, setPlayerSettings ] = useState(defaultPlayerSettings)

  useEffect(() => {
    setPlayerSettings(playerSettingsRaw ?? defaultPlayerSettings)
  },[playerSettingsRaw])

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

    console.log('Saving settings...')
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
    console.log(JSON.stringify(Object.values(newErrors)))
    if (!Object.values(newErrors).some(error => error)) {
      gameDatabase.settingDb.savePlayerSettings(playerSettings)
      console.log('Player settings saved:', playerSettings);
    }
  };

  if(loading) return (
    <Box>
      Loading...
    </Box>
  )

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
