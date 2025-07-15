import {Log} from "@src/shared/log/Log";

export interface Logger{
  log(log: Log): void

  logInfo(log: Omit<Log,"severity" | "id" | "timestamp">): void

  logDebug(log: Omit<Log,"severity" | "id" | "timestamp">): void

  logWarning(log: Omit<Log,"severity" | "id" | "timestamp">): void

  logError(log: Omit<Log,"severity" | "id" | "timestamp">): void

}