import { BackendAction } from '@src/shared/actions/backend/core/BackendAction';
import { BackendActionContext } from '@src/shared/actions/backend/core/BackendActionContext';
import getVillageOverview, { GetOverviewResult } from './getVillageOverview';

export const GET_OVERVIEW_ACTION = 'getOverviewAction';

export interface GetOverviewActionInput {
  // No input parameters needed for now
}

export interface GetOverviewActionOutput extends GetOverviewResult {
  // Extends GetOverviewResult to include any additional output data if needed
}

export class GetOverviewAction implements BackendAction<GetOverviewActionInput, GetOverviewActionOutput> {
  async execute(context: BackendActionContext, action: GetOverviewActionInput): Promise<GetOverviewActionOutput> {
    return getVillageOverview(context);
  }
}
