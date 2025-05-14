import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import { buildGameUrlWithScreen} from "@src/shared/helpers/buildUrl";

export default async function getUserMetadataAction(context: BackendActionContext) {
  const { messenger } = context;
  const pageStatus = await messenger.executePageStatusAction({});
  // check if is in game verify if url from pageStatus is equals value from pageStatus.details?.url

  const url = buildGameUrlWithScreen(context.playerSettings.server,{
    screen : "overview_villages",
    village: undefined, //TOD

  }, {})

  await messenger.executeNavigateToPageAction({ url, reload: true})
  //TODO go to overview and extract all vilalges

  //TODO extract playerId if not extracted yet
}