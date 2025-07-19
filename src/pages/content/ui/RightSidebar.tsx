import React, {useState} from "react";
import {Box, Flex} from "@chakra-ui/react";
import {SidebarToggleButton} from "@pages/content/ui/SidebarToggleButton";
import TribalCard from "@src/shared/ui/TribalCard";
import {SettingsContainer} from "@pages/content/ui/SettingsContainer";
import {LogsPanel} from "./LogsPanel";
import {SidebarSettingsPanel} from "./SidebarSettingsPanel";
import {TribalSimpleTabList, TribalTab, TribalTabPanel, TribalTabPanels, TribalTabs} from '@src/shared/ui/TribalTabs';

interface RightSidebarProps {
  rightSidebarVisible: boolean;
  setRightSidebarVisible: (visible: boolean) => Promise<void>;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
                                                            rightSidebarVisible,
                                                            setRightSidebarVisible,
                                                          }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabsChange = (index: number) => setTabIndex(index);

  return (
    <Box
      pointerEvents={rightSidebarVisible ? "auto" : "none"}
      position="fixed"
      top="0"
      right="4"
      height="100vh"
      width="50%"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      sx={{display: "flex !important", flexDirection: "column !important", height: "100vh !important"}}
    >
      <Flex p={2} justifyContent="flex-end" pointerEvents="none">
        <SidebarToggleButton
          isVisible={rightSidebarVisible}
          onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
          position="right"
        />
      </Flex>
      {rightSidebarVisible && (<Box
          visibility={rightSidebarVisible ? "visible" : "hidden"}
          flex="1"
          pointerEvents="auto"
          display="flex"
          flexDirection="column"
          overflow="hidden"
          sx={{
            flex: "1 !important",
            display: "flex !important",
            flexDirection: "column !important",
            height: "100% !important"
          }}
        >
          <TribalCard
            style={{height: "100%", display: "flex", flexDirection: "column", overflow: "hidden"}}
          >
            <TribalTabs
              isLazy={true}
              style={{display: "flex", flexDirection: "column", height: "100%", overflow: "hidden"}}
              sx={{display: "flex !important", flexDirection: "column !important", height: "100% !important"}}
              index={tabIndex}
              onChange={handleTabsChange}
              variant="unstyled"
              size="md"
            >
              <TribalSimpleTabList>
                <TribalTab>VillageSettings</TribalTab>
                <TribalTab>Logs</TribalTab>
                <TribalTab>Settings</TribalTab>
              </TribalSimpleTabList>
              <TribalTabPanels
                style={{paddingTop: "2px", flex: "1", display: "flex", flexDirection: "column", overflow: "auto"}}
                sx={{
                  flex: "1 !important",
                  display: "flex !important",
                  flexDirection: "column !important",
                  overflow: "auto !important"
                }}
              >
                <TribalTabPanel noBorder noPadding style={{height: "100%", overflow: "auto"}}
                                sx={{overflow: "auto !important", height: "100% !important"}}>
                  <SettingsContainer isOpen={rightSidebarVisible}/>
                </TribalTabPanel>
                <TribalTabPanel noBorder noPadding style={{height: "100%", overflow: "auto"}}
                                sx={{overflow: "auto !important", height: "100% !important"}}>
                  <LogsPanel/>
                </TribalTabPanel>
                <TribalTabPanel noBorder noPadding style={{height: "100%", overflow: "auto"}}
                                sx={{overflow: "auto !important", height: "100% !important"}}>
                  <SidebarSettingsPanel/>
                </TribalTabPanel>
              </TribalTabPanels>
            </TribalTabs>
          </TribalCard>
        </Box>
      )}
    </Box>
  );
};
