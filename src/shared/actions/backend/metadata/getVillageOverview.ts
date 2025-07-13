import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import { buildGameUrlWithScreen} from "@src/shared/helpers/buildUrl";
import { parseVillageOverview } from "./parseVillageOverview";
import {VillageOverview} from "@src/shared/models/game/VillageOverview";
import {parseVillageOverviewPremium} from "@src/shared/actions/backend/metadata/parseVillageOverviewPremium";
import {isPremiumAccount} from "@src/shared/actions/backend/metadata/isPremiumAccount";

export interface GetOverviewResult {
  villages: VillageOverview[];
}

export default async function getVillageOverview(context: BackendActionContext): Promise<GetOverviewResult> {
  const { messenger } = context;
  // check if is in game verify if url from pageStatus is equals value from pageStatus.details?.url

  const url = buildGameUrlWithScreen(context.playerSettings.server,{
    screen : "overview_villages",
    mode: "prod",
    village: undefined, //TOD
  }, {})

  await messenger.executeNavigateToPageAction({ url, reload: true});

  const pageStatus = await messenger.executePageStatusAction({});

  const overviewContent = pageStatus.details?.pageContent ?? '';
  const isPremium = isPremiumAccount(overviewContent)

  await context.gameDatabase.settingDb.savePlayerSettings({
    ...context.playerSettings,
    hasPremium: isPremium,
  });

  // Extract all villages from the overview page
  const villages = await context.helpers.runBasedOnPremium(() => parseVillageOverviewPremium(overviewContent),
    () => parseVillageOverview(overviewContent));
  if(villages.length > 0){
    await context.gameDatabase.accountDb.saveVillageOverviews(villages)
  }

  return { villages };
}
