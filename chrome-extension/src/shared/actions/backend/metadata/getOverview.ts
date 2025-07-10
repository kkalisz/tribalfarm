import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import { buildGameUrlWithScreen} from "@src/shared/helpers/buildUrl";
import { parseVillageOverview, VillageOverviewData } from "./parseVillageOverview";

export interface GetOverviewResult {
  villages: VillageOverviewData[];
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
  const villages = parseVillageOverview(pageStatus.details?.pageContent ?? '');

  return { villages };
}
