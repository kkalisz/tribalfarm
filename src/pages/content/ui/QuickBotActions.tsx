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

interface QuickBotActionsProps {
  actionExecutor: ContentActionExecutor;
}

export const QuickBotActions: React.FC<QuickBotActionsProps> = ({
                                                            actionExecutor,
                                                          }) => {

  const onReattach = useCallback(() => {
    const ressult = actionExecutor.sendUiActionRequestWithResponse({
      type: INVALIDATE_PLAYER_SERVICE,
    });
  },[]);

  return (
    <Box
      height="100vh"
      width="50%"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      sx={{display: "flex !important", flexDirection: "column !important", height: "100vh !important"}}
    >
      <TribalButton onClick={onReattach} pointerEvents="auto" >
      </TribalButton>
    </Box>
  );
};
