import {logInfo} from "@src/shared/helpers/sendLog";

const fiveMinutesInMs = 5 * 60 * 1000;

export interface ScheduleTaskOptions<T> {
  type: string;
  input?: T;
  exclusive?: boolean;
  priority?: number;
  runAt?: Date;
  intervalMs?: number;
}

interface TaskWrapper {
  id: string;
  input: Record<any, any>;
  type: string;
  lastRun: number | null;
  nextRun: number;
  running: boolean;
  priority: number;
  intervalMs: number | null;
  tag?: string;
}

/**
 * Extracts essential details from a TaskWrapper object
 * @param task The TaskWrapper to extract details from
 * @returns An object containing the task type and formatted next run time
 */
export function extractTaskDetails(task: TaskWrapper): { type: string; nextRunTime: string; nextRunTimeLocal: string } {
  const nextRunDate = new Date(task.nextRun);
  return {
    type: task.type,
    nextRunTime: nextRunDate.toISOString(),
    nextRunTimeLocal: nextRunDate.toLocaleString(),
  };
}

/**
 * Logs details of tasks in both parallel and exclusive queues
 * @param parallelQueue Array of parallel tasks
 * @param exclusiveQueue Array of exclusive tasks
 */
export function logQueueDetails(parallelQueue: TaskWrapper[], exclusiveQueue: TaskWrapper[]): void {
  console.log('--- Queue Details ---');
  
  console.log('Parallel Queue:');
  if (parallelQueue.length === 0) {
    console.log('  No tasks in parallel queue');
  } else {
    parallelQueue.forEach((task, index) => {
      const details = extractTaskDetails(task);
      console.log(`  Task ${index + 1}: Type: ${details.type}, Next Run: ${details.nextRunTime} -> local ${details.nextRunTimeLocal}`);
    });
  }
  
  console.log('Exclusive Queue:');
  if (exclusiveQueue.length === 0) {
    console.log('  No tasks in exclusive queue');
  } else {
    exclusiveQueue.forEach((task, index) => {
      const details = extractTaskDetails(task);
      console.log(`  Task ${index + 1}: Type: ${details.type}, Next Run: ${details.nextRunTime} -> local ${details.nextRunTimeLocal}`);
    });
  }
  
  console.log('-------------------');
}

export class ActionScheduler {
  private taskIdCounter = 0;
  private paused = false;
  private isExclusiveRunning = false;
  private exclusiveQueue: TaskWrapper[] = [];
  private parallelQueue: TaskWrapper[] = [];
  private readonly intervalHandle: ReturnType<typeof setInterval>;
  private executor: (type: string, action: Record<any,any>) => Promise<void> = () => Promise.resolve();
  private lastLogTime = 0; // Track the last time queue details were logged

  constructor(private persist?: (state: never) => void, private restore?: () => never) {
    this.intervalHandle = setInterval(() => this.runLoop(), 1000);
  }

  public setExecutor(executor: (type: string, action: Record<any,any>) => Promise<void>): void {
    this.executor = executor;
  }

  public pause(): void {
    this.paused = true;
  }

  public resume(): void {
    this.paused = false;
  }

  public stop(): void {
    clearInterval(this.intervalHandle);
  }

  public scheduleTask<T = any>(typeOrOptions: string | ScheduleTaskOptions<T>): string {
    // If first parameter is an object, use it as options
    if (typeof typeOrOptions === 'object') {
      return this.scheduleTaskWithOptions(typeOrOptions);
    }
    return this.scheduleTaskWithOptions({
      type: typeOrOptions,
      exclusive: true,
    })
  }

  private scheduleTaskWithOptions<T>(options: ScheduleTaskOptions<T>): string {
    const { type, input, exclusive, priority, runAt, intervalMs } = options;
    const id = `${Date.now()}_${this.taskIdCounter++}`;
    const task: TaskWrapper = {
      id,
      input: input as Record<any, any>,
      type: type,
      lastRun: null,
      nextRun: runAt ? runAt.getTime() : Date.now(),
      running: false,
      priority: priority ?? 0,
      intervalMs: intervalMs ?? null
    };

    if (exclusive) {
      this.exclusiveQueue.push(task);
    } else {
      this.parallelQueue.push(task);
    }

    return id;
  }

  public removeById(id: string): void {
    this.exclusiveQueue = this.exclusiveQueue.filter(t => t.id !== id);
    this.parallelQueue = this.parallelQueue.filter(t => t.id !== id);
  }

  public removeByPredicate(predicate: (input: TaskWrapper) => boolean): void {
    this.exclusiveQueue = this.exclusiveQueue.filter(t => !predicate(t));
    this.parallelQueue = this.parallelQueue.filter(t => !predicate(t));
  }

  private async runLoop(): Promise<void> {
    logInfo("action scheduler loop start")
    if (this.paused) return;
    const now = Date.now();
    
    // Check if 5 minutes (300,000 ms) have passed since the last log
    if (now - this.lastLogTime >= fiveMinutesInMs) {
      logQueueDetails(this.parallelQueue, this.exclusiveQueue);
      this.lastLogTime = now;
    }

    this.exclusiveQueue.sort((a, b) => a.nextRun - b.nextRun || (b.priority ?? 0) - (a.priority ?? 0));
    this.parallelQueue.sort((a, b) => a.nextRun - b.nextRun || (b.priority ?? 0) - (a.priority ?? 0));
    
    if (!this.isExclusiveRunning) {
      const exclusive = this.exclusiveQueue.find(t => !t.running && now >= t.nextRun);
      if (exclusive) {
        exclusive.running = true;
        this.isExclusiveRunning = true;

        this.runTask(exclusive).then(() => {
          exclusive.running = false;
          this.isExclusiveRunning = false;
          exclusive.lastRun = now;

          if (exclusive.intervalMs) {
            exclusive.nextRun = now + exclusive.intervalMs;
          } else {
            this.exclusiveQueue = this.exclusiveQueue.filter(t => t.id !== exclusive.id);
          }
        });
      }
    }

    const readyParallel = this.parallelQueue.filter(t => !t.running && now >= t.nextRun);
    for (const task of readyParallel) {
      task.running = true;
      this.runTask(task).then(() => {
        task.running = false;
        task.lastRun = now;

        if (task.intervalMs) {
          task.nextRun = now + task.intervalMs;
        } else {
          this.parallelQueue = this.parallelQueue.filter(t => t.id !== task.id);
        }
      });
    }
  }

  private async runTask(task: TaskWrapper): Promise<void> {
    try {
      await this.executor(task.type, task.input)
    } catch (err) {
      console.error(`[TaskScheduler] Task failed`, err);
    }
  }
}


