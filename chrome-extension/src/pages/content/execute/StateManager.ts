import { CommandMessage } from "@src/shared/actions/content/core/types";

// Type definition for state subscribers
export type StateSubscriber = () => void;

/**
 * StateManager handles the state management for the executor
 * It manages the current command, status, events, logs, and subscriptions
 * 
 * Note: The binding/subscription system is simplified as it's not needed in most cases.
 * Only UI components that need to react to state changes should use subscriptions.
 */
export class StateManager {
  // State variables
  private currentCommand: CommandMessage | null = null;
  private commandStatus: string = 'idle';
  private logs: string[] = [];
  private paused: boolean = false;

  // Subscribers for state changes (only used by UI components)
  private subscribers: StateSubscriber[] = [];

  constructor() {}

  // State setters
  public setCurrentCommand(command: CommandMessage | null): void {
    this.currentCommand = command;
    // Only notify subscribers if there are any
    if (this.subscribers.length > 0) {
      this.notifySubscribers();
    }
  }

  public setCommandStatus(status: string): void {
    this.commandStatus = status;
    // Only notify subscribers if there are any
    if (this.subscribers.length > 0) {
      this.notifySubscribers();
    }
  }

  public setPaused(paused: boolean): void {
    this.paused = paused;
    // Only notify subscribers if there are any
    if (this.subscribers.length > 0) {
      this.notifySubscribers();
    }
  }

  public isPaused(): boolean {
    return this.paused;
  }

  public setLogs(newLogs: string[]): void {
    this.logs = newLogs;
    // Only notify subscribers if there are any
    if (this.subscribers.length > 0) {
      this.notifySubscribers();
    }
  }

  public addLog(message: string): void {
    this.logs = [...this.logs, `${new Date().toLocaleTimeString()}: ${message}`];
    // Only notify subscribers if there are any
    if (this.subscribers.length > 0) {
      this.notifySubscribers();
    }
  }

  // Notify all subscribers when state changes
  private notifySubscribers(): void {
    this.subscribers.forEach(subscriber => subscriber());
  }

  // Subscribe to state changes (only used by UI components)
  public subscribeToState(callback: StateSubscriber): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Get current state
  public getState(): {
    currentCommand: CommandMessage | null;
    commandStatus: string;
    logs: string[];
    paused: boolean;
  } {
    return {
      currentCommand: this.currentCommand,
      commandStatus: this.commandStatus,
      logs: this.logs,
      paused: this.paused
    };
  }

  // Save state to session storage
  public saveStateToStorage(key: string = 'tribalFarmState'): void {
    sessionStorage.setItem(key, JSON.stringify({
      currentCommand: this.currentCommand,
      commandStatus: this.commandStatus,
      logs: this.logs,
      paused: this.paused
    }));
  }

  // Load state from session storage
  public loadStateFromStorage(key: string = 'tribalFarmState'): boolean {
    const savedState = sessionStorage.getItem(key);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        this.setCurrentCommand(parsed.currentCommand);
        this.setCommandStatus(parsed.commandStatus);
        this.setLogs(parsed.logs || []);
        this.setPaused(parsed.paused || false);
        return true;
      } catch (e) {
        console.error('Failed to parse saved state:', e);
        return false;
      }
    }
    return false;
  }

  // Clear state from session storage
  public clearStateFromStorage(key: string = 'tribalFarmState'): void {
    sessionStorage.removeItem(key);
  }
}

// Create a singleton instance
export const stateManager = new StateManager();
