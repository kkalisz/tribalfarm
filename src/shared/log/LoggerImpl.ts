import {GameDataBaseAccess} from "@src/shared/db/GameDataBaseAcess";
import {Logger} from "@src/shared/log/Logger";
import {Log, LogSeverity} from "./Log";

export class LoggerImpl implements Logger {

  constructor(private readonly database: GameDataBaseAccess) {
  }

  log(log: Omit<Log,"id">): void {
    console.log(log.content)
    void this.database.logsDb.saveLog(log).catch(console.error);
  }

  logInfo(log: Omit<Log, "severity" | "id">): void {
    this.log({
      ...log,
      severity: LogSeverity.INFO,
    })
  }

  logDebug(log: Omit<Log, "severity" | "id">): void {
    this.log({
      ...log,
      severity: LogSeverity.DEBUG,
    })
  }

  logWarning(log: Omit<Log, "severity" | "id">): void {
    this.log({
      ...log,
      severity: LogSeverity.WARNING,
    })
  }

  logError(log: Omit<Log,"severity" | "id">): void {
    this.log({
      ...log,
      severity: LogSeverity.INFO,
    })
  }
}