import React, {useCallback, useState} from "react";
import {Box, Flex} from "@chakra-ui/react";
import {SidebarToggleButton} from "@pages/content/ui/SidebarToggleButton";
import TribalCard from "@src/shared/ui/TribalCard";
import {SettingsContainer} from "@pages/content/ui/SettingsContainer";
import {LogsPanel} from "./LogsPanel";
import {SidebarSettingsPanel} from "./SidebarSettingsPanel";
import {TribalSimpleTabList, TribalTab, TribalTabPanel, TribalTabPanels, TribalTabs} from '@src/shared/ui/TribalTabs';
import TribalButton from "@src/shared/ui/TribalButton";
import {ContentActionExecutor} from "@pages/content/execute/ContentActionExecutor";
import {INVALIDATE_PLAYER_SERVICE} from "@pages/background/BackgroundCommands";
import TribalIconButton from "@src/shared/ui/TribalIconButton";
import green from '@assets/img/green.webp';
import red from '@assets/img/red.webp';


interface QuickBotActionsProps {
  actionExecutor: ContentActionExecutor;
}

export const QuickBotActions: React.FC<QuickBotActionsProps> = ({
  actionExecutor,
}) => {
  const [isAttached, setIsAttached] = useState(false);

  const checkStatus = useCallback(async () => {

  },[])

  const onReattach = useCallback(async () => {
    // const invalidateResult = await actionExecutor.sendUiActionRequestWithResponse({
    //   type: INVALIDATE_PLAYER_SERVICE,
    // });

    const result = await actionExecutor.retrieveContentScriptData();
    setIsAttached(result.currenTabId === result.mainTabId);
  }, []);

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      sx={{display: "flex", flexDirection: "column", height: "100vh"}}
    >
      <TribalIconButton onClick={onReattach} pointerEvents="auto" iconSrc={ isAttached ? green : red }>
      </TribalIconButton>
    </Box>
  );
};
