/**
 * Enum representing different severity levels for logs
 */
export enum LogSeverity {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

/**
 * Interface representing a log entry in the system
 */
export interface Log {
  /**
   * Unique identifier for the log entry
   */
  id: string;
  
  /**
   * Optional ID of the village associated with this log
   */
  sourceVillage?: number;
  
  /**
   * Severity level of the log
   */
  severity: LogSeverity;
  
  /**
   * Type/category of the log for filtering purposes
   */
  type: string;
  
  /**
   * Timestamp when the log was created (milliseconds since epoch)
   */
  timestamp: number;
  
  /**
   * Content/message of the log
   */
  content: string;
}

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