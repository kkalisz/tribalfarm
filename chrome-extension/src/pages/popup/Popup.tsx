import React, {useMemo, useState} from 'react';
import {useGuiSettings} from '@src/shared/hooks/useGuiSettings';
import {Box, Flex, FormLabel, Link, TabPanels, Text} from '@chakra-ui/react';
import {usePluginSettings} from "@src/shared/hooks/usePluginSettings";
import TribalButton from "@src/shared/ui/TribalButton";
import TribalCard from "@src/shared/ui/TribalCard";
import TribalSwitch from "@src/shared/ui/TribalSwitch";
import PlayerSettingsTab from "./PlayerSettingsTab";
import {TribalTab, TribalTabList, TribalTabPanel, TribalTabs} from "@src/shared/ui/TribalTabs";
import {SettingsStorageService} from "@src/shared/services/settingsStorage";
import TribalText from "@src/shared/ui/TribalText";

interface SettingsSwitchProps {
  label: string;
  name: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

const SettingsSwitch: React.FC<SettingsSwitchProps> = ({label, name, enabled, onChange}) => {
  return (
    <Flex mt={2} alignItems="center" justifyContent="space-between">
      <FormLabel htmlFor={name} mb={0}>{label}</FormLabel>
      <TribalSwitch
        id={name}
        isChecked={enabled}
        onChange={(e) => onChange(e.target.checked)}
        size="md"
      />
    </Flex>
  );
};

export default function Popup() {
  const {gui} = useGuiSettings();
  const {plugin} = usePluginSettings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const gameUrlInfo = useMemo(() => {
    return getGameUrlInfo(window.location.href)
  }, [window.location.href])

  const settings = useMemo(() => {
    return new SettingsStorageService(gameUrlInfo.fullDomain ?? "")
  }, [gameUrlInfo])

  if (!gameUrlInfo.isValid) {
    return <TribalCard variant={"standard"}>
      <TribalText>
        Not in a game page
      </TribalText>
    </TribalCard>
  }

  return (
    <Box textAlign="center" height="full" p={3} backgroundColor="tribal.rootBg">
      <Flex as="header" flexDirection="column" alignItems="center" justifyContent="center">
        <Box width="full" maxWidth="md" sx={{sm: {px: 0}}}>
          <TribalTabs>
            <TribalTabList gap={2}>
              <TribalTab>
                Settings
              </TribalTab>
              <TribalTab>
                Player
              </TribalTab>
              <TribalTab>
                About
              </TribalTab>
            </TribalTabList>
            <TabPanels >
              <TribalTabPanel>
                <TribalCard variant={"secondary"}>
                  <SettingsSwitch onChange={plugin.setVisible} label={'Enable plugin'} name={'settings-enabled'} enabled={plugin.visible}/>
                  <SettingsSwitch onChange={gui.setVisible} label={'Show gui'} name={'settings-gui'} enabled={gui.visible}/>
                  <TribalButton
                    onClick={() => setIsDialogOpen(true)}
                    mt={4}
                    px={4}
                    py={2}
                  >
                    More Info
                  </TribalButton>
                </TribalCard>
              </TribalTabPanel>
              <TribalTabPanel>
                <PlayerSettingsTab settings={settings}/>
              </TribalTabPanel>
              <TribalTabPanel>
                <Text fontSize="sm">
                  This is a Chrome extension built with React, TypeScript, and Chakra UI.
                </Text>
                <Text mt={2} fontSize="sm">
                  UI components powered by Chakra UI.
                </Text>
                <Link
                  mt={2}
                  display="block"
                  color="blue.400"
                  href="https://chakra-ui.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about Chakra UI
                </Link>
              </TribalTabPanel>
            </TabPanels>
          </TribalTabs>
        </Box>
      </Flex>
    </Box>
  );
}
