import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import { buildGameUrlWithScreen} from "@src/shared/helpers/buildUrl";
import { parseVillageOverview } from "./parseVillageOverview";
import {VillageOverview} from "@src/shared/models/game/VillageOverview";
import {parseVillageOverviewPremium} from "@src/shared/actions/backend/metadata/parseVillageOverviewPremium";

export interface GetOverviewResult {
  villages: VillageOverview[];
}

export default async function getOverview(context: BackendActionContext): Promise<GetOverviewResult> {
  const { messenger } = context;
  // check if is in game verify if url from pageStatus is equals value from pageStatus.details?.url

  const url = buildGameUrlWithScreen(context.playerSettings.server,{
    screen : "overview_villages",
    mode: "prod",
    village: undefined, //TOD
  }, {})

  const response = await messenger.executeNavigateToPageAction({ url, reload: true});

  const pageStatus = await messenger.executePageStatusAction({});

  // Extract all villages from the overview page
  const villages = await context.helpers.runBasedOnPremium(() => parseVillageOverviewPremium(pageStatus.details?.pageContent ?? ''),
    () => parseVillageOverview(pageStatus.details?.pageContent ?? ''));
  if(villages.length > 0){
    await context.gameDatabase.accountDb.saveVillageOverviews(villages)
  }

  return { villages };
}
