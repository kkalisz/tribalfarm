import { CommandMessage } from "@src/shared/actions/content/core/types";

// Type definition for state subscribers
export type StateSubscriber = () => void;

/**
 * StateManager handles the state management for the executor
 * It manages the current command, status, events, logs, and subscriptions
 */
export class StateManager {
  // State variables
  private currentCommand: CommandMessage | null = null;
  private commandStatus: string = 'idle';
  private logs: string[] = [];
  
  // Subscribers for state changes
  private subscribers: StateSubscriber[] = [];

  constructor() {}

  // State setters
  public setCurrentCommand(command: CommandMessage | null): void {
    this.currentCommand = command;
    this.notifySubscribers();
  }

  public setCommandStatus(status: string): void {
    this.commandStatus = status;
    this.notifySubscribers();
  }
  public setLogs(newLogs: string[]): void {
    this.logs = newLogs;
    this.notifySubscribers();
  }

  public addLog(message: string): void {
    this.logs = [...this.logs, `${new Date().toLocaleTimeString()}: ${message}`];
    this.notifySubscribers();
  }

  // Notify all subscribers when state changes
  private notifySubscribers(): void {
    this.subscribers.forEach(subscriber => subscriber());
  }

  // Subscribe to state changes
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
  } {
    return {
      currentCommand: this.currentCommand,
      commandStatus: this.commandStatus,
      logs: this.logs
    };
  }

  // Save state to session storage
  public saveStateToStorage(key: string = 'tribalFarmState'): void {
    sessionStorage.setItem(key, JSON.stringify({
      currentCommand: this.currentCommand,
      commandStatus: this.commandStatus,
      logs: this.logs
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