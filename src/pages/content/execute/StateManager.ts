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
  private state: {
    currentCommand: CommandMessage | null;
    commandStatus: string;
    logs: string[];
    paused: boolean;
  } = {
    currentCommand: null,
    commandStatus: 'idle',
    logs: [],
    paused: false,
  };

  // Field-specific subscribers
  private fieldSubscribers: Record<string, ((newValue: any) => void)[]> = {};

  constructor(private keyPrefix: string = '') {}

  /**
   * Subscribe to changes for a specific field.
   * @param field The field name to subscribe to.
   * @param callback The callback that will be invoked with the new value of the field when it changes.
   * @returns A function to unsubscribe from the field's changes.
   */
  public subscribeToField<K extends keyof typeof this.state>(
    field: K,
    callback: (newValue: typeof this.state[K]) => void
  ): () => void {
    if (!this.fieldSubscribers[field]) {
      this.fieldSubscribers[field] = [];
    }
    this.fieldSubscribers[field].push(callback);

    // Return an unsubscribe function
    return () => {
      const index = this.fieldSubscribers[field].indexOf(callback);
      if (index !== -1) {
        this.fieldSubscribers[field].splice(index, 1);
      }
    };
  }

  /**
   * Generic state property updater with field change notifications.
   * @param field The field name to update.
   * @param value The new value for the field.
   */
  public setField<K extends keyof typeof this.state>(field: K, value: typeof this.state[K]): void {
    if (this.state[field] === value) return; // Prevent unnecessary updates
    this.state[field] = value; // Update the field value
    this.notifyFieldSubscribers(field); // Notify subscribers of this specific field
  }


  /**
   * Notify all subscribers of a specific field with its new value.
   * @param field The field name to notify subscribers about.
   */
  private notifyFieldSubscribers<K extends keyof typeof this.state>(field: K): void {
    const subscribers = this.fieldSubscribers[field];
    if (subscribers) {
      const newValue = this.state[field];
      subscribers.forEach(callback => callback(newValue));
    }
  }

  /**
   * Generic setter for state fields, with field-specific notifications.
   * @param field The field name to set.
   * @param value The new value to set for the field.
   */
  private setStateField<K extends keyof typeof this.state>(field: K, value: typeof this.state[K]): void {
    if (this.state[field] === value) return; // No updates if the value hasn't changed
    this.state[field] = value;
    this.notifyFieldSubscribers(field); // Notify subscribers with the new value
  }

  // Field-specific setters
  public setCurrentCommand(command: CommandMessage | null): void {
    this.setStateField('currentCommand', command);
  }

  public setCommandStatus(status: string): void {
    this.setStateField('commandStatus', status);
  }

  public addLog(message: string): void {
    const newLog = `${new Date().toLocaleTimeString()}: ${message}`;
    const updatedLogs = [...this.state.logs, newLog]; // Create a new logs array
    this.setStateField('logs', updatedLogs); // Update the state and notify subscribers
  }


  public setLogs(newLogs: string[]): void {
    this.setStateField('logs', newLogs);
  }

  public setPaused(paused: boolean): void {
    this.setStateField('paused', paused);
  }

  // Save state to session storage
  public saveStateToStorage(key: string = 'tribalFarmState'): void {
    const prefixedKey = this.keyPrefix ? `${this.keyPrefix}_${key}` : key;
    sessionStorage.setItem(prefixedKey, JSON.stringify(this.state));
  }

  // Load state from session storage
  public loadStateFromStorage(key: string = 'tribalFarmState'): boolean {
    const prefixedKey = this.keyPrefix ? `${this.keyPrefix}_${key}` : key;
    const savedState = sessionStorage.getItem(prefixedKey);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        Object.keys(parsed).forEach(key => {
          if (key in this.state) {
            this.setStateField(key as keyof typeof this.state, parsed[key as keyof typeof this.state]);
          }
        });
        return true;
      } catch (e) {
        console.error('Failed to parse saved state:', e);
        return false;
      }
    }
    return false;
  }

  // Retrieve the full state
  public getState(): typeof this.state {
    return { ...this.state };
  }


  // Clear state from session storage
  public clearStateFromStorage(key: string = 'tribalFarmState'): void {
    const prefixedKey = this.keyPrefix ? `${this.keyPrefix}_${key}` : key;
    sessionStorage.removeItem(prefixedKey);
  }
}
