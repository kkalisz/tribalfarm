import React, { useState } from "react";
import {Box} from '@chakra-ui/react';
import { BaseVillageInfo } from "@src/shared/models/game/BaseVillageInfo";
import { ScavengeTab } from "./tabs/ScavengeTab";
import { FarmingTab } from "./tabs/FarmingTab";
import { BuildingTab } from "./tabs/BuildingTab";
import { RecruitmentTab } from "./tabs/RecruitmentTab";
import { DefenceTab } from "./tabs/DefenceTab";
import barracks from '@assets/img/barracks.webp';
import barracks1 from '@assets/img/barracks1.webp';
import main from '@assets/img/main.webp';
import wall from '@assets/img/wall1.webp';
import storage from '@assets/img/storage.webp';

import {
  TribalTabs,
  TribalTabPanels,
  TribalTabPanel,
  TribalSimpleTabList, TribalIconTab
} from '@src/shared/ui/TribalTabs';

interface VillageSettingsProps {
  village: BaseVillageInfo;
}

export const VillageSettings: React.FC<VillageSettingsProps> = ({ village }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  return (
    <Box width="100%" key={village.villageId}>
      <TribalTabs 
        index={tabIndex} 
        onChange={handleTabsChange}
        variant="unstyled"
        size="md"
      >
        <TribalSimpleTabList width="fit-content">
          <TribalIconTab iconSrc={storage} alt="Scavenging" />
          <TribalIconTab iconSrc={barracks} alt="Farm" />
          <TribalIconTab iconSrc={main} alt="Building" />
          <TribalIconTab iconSrc={barracks1} alt="Recruiting" />
          <TribalIconTab iconSrc={wall} alt="Defense" />
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