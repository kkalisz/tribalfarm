import {HOUR_IN_MS, MINUTE_IN_MS, SECOND_IN_MS} from "@src/shared/helpers/time";

export function parseTimeToMiliSeconds(timeStr: string | null): number | null {
  if(!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length !== 3) return -1;

  const [hours, minutes, seconds] = parts.map(Number);
  if ([hours, minutes, seconds].some(isNaN)) return null;

  return hours * HOUR_IN_MS + minutes * MINUTE_IN_MS + seconds * SECOND_IN_MS;
}