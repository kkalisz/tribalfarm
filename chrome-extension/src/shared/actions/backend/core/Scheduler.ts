// File: task_scheduler.ts

export interface TaskInput {

}

interface TaskWrapper {
  id: string;
  action: TaskInput;
  lastRun: number | null;
  nextRun: number;
  running: boolean;
  priority: number;
  intervalMs: number | null
}

export class TaskScheduler {
  private taskIdCounter = 0;
  private paused = false;
  private isExclusiveRunning = false;
  private exclusiveQueue: TaskWrapper[] = [];
  private parallelQueue: TaskWrapper[] = [];
  private readonly intervalHandle: ReturnType<typeof setInterval>;

  constructor(private persist?: (state: any) => void, private restore?: () => any) {
    this.intervalHandle = setInterval(() => this.runLoop(), 1000);
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

  public scheduleTask(input: TaskInput,  exclusive: boolean, priority: number, runAt?: Date, intervalMs?: number): string {
    const id = `${Date.now()}_${this.taskIdCounter++}`;
    const task: TaskWrapper = {
      id,
      action: input,
      lastRun: null,
      nextRun: runAt ? runAt.getTime() : Date.now(),
      running: false,
      priority: priority,
      intervalMs: intervalMs ? intervalMs : null
    };

    if (exclusive) {
      this.exclusiveQueue.push(task);
    } else {
      this.parallelQueue.push(task);
    }

    this.save();
    return id;
  }

  public removeById(id: string): void {
    this.exclusiveQueue = this.exclusiveQueue.filter(t => t.id !== id);
    this.parallelQueue = this.parallelQueue.filter(t => t.id !== id);
    this.save();
  }

  // public removeByType(type: string): void {
  //   this.exclusiveQueue = this.exclusiveQueue.filter(t => t.action.type !== type);
  //   this.parallelQueue = this.parallelQueue.filter(t => t.action.type !== type);
  //   this.save();
  // }

  public removeByPredicate(predicate: (input: TaskInput) => boolean): void {
    this.exclusiveQueue = this.exclusiveQueue.filter(t => !predicate(t.action));
    this.parallelQueue = this.parallelQueue.filter(t => !predicate(t.action));
    this.save();
  }

  private async runLoop(): Promise<void> {
    if (this.paused) return;
    const now = Date.now();

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

          this.save();
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

        this.save();
      });
    }
  }

  private async runTask(task: TaskWrapper): Promise<void> {
    try {
      await task.action.run();
    } catch (err) {
      console.error(`[TaskScheduler] Task failed`, err);
    }
  }

  private save(): void {
    if (this.persist) {
      this.persist({
        exclusiveQueue: this.exclusiveQueue,
        parallelQueue: this.parallelQueue,
        taskIdCounter: this.taskIdCounter
      });
    }
  }

  public restoreFromStorage(): void {
    if (!this.restore) return;
    const state = this.restore();
    if (!state) return;
    this.exclusiveQueue = state.exclusiveQueue || [];
    this.parallelQueue = state.parallelQueue || [];
    this.taskIdCounter = state.taskIdCounter || 0;
  }
}
