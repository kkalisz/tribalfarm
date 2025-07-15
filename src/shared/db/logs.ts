import {LogSeverity} from "@src/shared/log/Log";

/**
 * Interface for log pagination parameters
 */
export interface LogPaginationParams {
  /**
   * Maximum number of logs to return
   */
  limit: number;

  /**
   * Cursor for pagination (typically the ID of the last log from previous page)
   */
  cursor?: string;

  /**
   * Direction of sorting (ascending or descending)
   */
  direction?: 'asc' | 'desc';
}

/**
 * Interface for log filtering parameters
 */
export interface LogFilterParams {
  /**
   * Filter logs by severity
   */
  severity?: LogSeverity;

  /**
   * Filter logs by type
   */
  type?: string;

  /**
   * Filter logs by source village ID
   */
  sourceVillage?: number;

  /**
   * Filter logs by start timestamp
   */
  startTimestamp?: number;

  /**
   * Filter logs by end timestamp
   */
  endTimestamp?: number;
}