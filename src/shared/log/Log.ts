/**
 * Enum representing different severity levels for logs
 */
export enum LogSeverity {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export type LogType = "action" | "scavenge" | "farm" | "build" | "recruit" | string

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
  type: LogType;
  
  /**
   * Timestamp when the log was created (milliseconds since epoch)
   */
  timestamp: number;
  
  /**
   * Content/message of the log
   */
  content: string;
}
