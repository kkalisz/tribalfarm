import { CommandPayload } from '../base/CommandMessage';
import {EventPayload} from "@src/shared/models/base";

export interface GetUserVillagesActionParameters {
  userId: string | "me";
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface UserVillageResponse {
  villageId: string;
  villageName: string;
  coordinates: Coordinates;
}

export interface GetUserMetadataResponse {
  userName: string;
  userId: string;
  villages: UserVillageResponse[];
}

export interface  GetUserVillagesActionPayload extends CommandPayload<GetUserMetadataResponsePayload> {
  action: 'userVillages';
  parameters:  GetUserVillagesActionParameters;
}

export interface GetUserMetadataResponsePayload extends EventPayload {
  eventType: 'userVillagesResponse';
  details: GetUserMetadataResponse;
}