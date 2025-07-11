import React, {useMemo} from 'react';
import {useGuiSettings} from '@src/shared/hooks/useGuiSettings';
import {Box, Flex, Link, TabPanels, Text} from '@chakra-ui/react';
import {usePluginSettings} from "@src/shared/hooks/usePluginSettings";
import TribalCard from "@src/shared/ui/TribalCard";
import PlayerSettingsTab from "./PlayerSettingsTab";
import {TribalTab, TribalTabList, TribalTabPanel, TribalTabs} from "@src/shared/ui/TribalTabs";
import TribalText from "@src/shared/ui/TribalText";
import {getGameUrlInfo} from "@src/shared/helpers/getGameUrlInfo";
import {useCurrentTabUrl} from "@src/shared/hooks/useCurrentTabUrl";
import {SettingsSwitch} from "@src/shared/SettingsSwitch";


export default function Popup() {
  const {gui} = useGuiSettings();
  const {plugin} = usePluginSettings();
  const currentTabUrl = useCurrentTabUrl(true);
  const gameUrlInfo = useMemo(() => {
    return getGameUrlInfo(currentTabUrl ?? '')
  }, [currentTabUrl])

  if (!gameUrlInfo.isValid) {
    return <TribalCard variant={"standard"}>
      <TribalText>
        {`Not in a game page: ${gameUrlInfo.fullDomain} ${currentTabUrl}`}
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
                  </TribalCard>
                </TribalTabPanel>
                <TribalTabPanel>
                  <PlayerSettingsTab gameUrlInfo={gameUrlInfo}/>
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
