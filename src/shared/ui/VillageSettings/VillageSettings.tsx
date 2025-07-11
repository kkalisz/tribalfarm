import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import { BaseVillageInfo } from "@src/shared/models/game/BaseVillageInfo";
import { ScavengeTab } from "./tabs/ScavengeTab";
import { FarmingTab } from "./tabs/FarmingTab";
import { BuildingTab } from "./tabs/BuildingTab";
import { RecruitmentTab } from "./tabs/RecruitmentTab";
import { DefenceTab } from "./tabs/DefenceTab";
import {
  TribalTabs,
  TribalTabList,
  TribalTab,
  TribalTabPanels,
  TribalTabPanel,
  TribalSimpleTabList
} from "@src/shared/ui/TribalTabs";

interface VillageSettingsProps {
  village: BaseVillageInfo;
}

export const VillageSettings: React.FC<VillageSettingsProps> = ({ village }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  return (
    <Box width="100%">
      <TribalTabs 
        index={tabIndex} 
        onChange={handleTabsChange}
        variant="unstyled"
        size="md"
      >
        <TribalSimpleTabList>
          <TribalTab>Scavenge</TribalTab>
          <TribalTab>Farming</TribalTab>
          <TribalTab>Building</TribalTab>
          <TribalTab>Recruitment</TribalTab>
          <TribalTab>Defence</TribalTab>
        </TribalSimpleTabList>

        <TribalTabPanels>
          <TribalTabPanel>
            <ScavengeTab village={village} />
          </TribalTabPanel>
          <TribalTabPanel>
            <FarmingTab village={village} />
          </TribalTabPanel>
          <TribalTabPanel>
            <BuildingTab village={village} />
          </TribalTabPanel>
          <TribalTabPanel>
            <RecruitmentTab village={village} />
          </TribalTabPanel>
          <TribalTabPanel>
            <DefenceTab village={village} />
          </TribalTabPanel>
        </TribalTabPanels>
      </TribalTabs>
    </Box>
  );
};