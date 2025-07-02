import { createContext, useContext } from 'react';
import { ExecutorAttacher } from '@pages/content/execute/ExecutorAttacher';

// Create the context with a default undefined value
export const ActionExecutorContext = createContext<ExecutorAttacher | undefined>(undefined);

export const useActionExecutorContext = (): ExecutorAttacher => {
  const context = useContext(ActionExecutorContext);

  if (context === undefined) {
    throw new Error('useActionExecutorContext must be used within a Provider');
  }

  return context;
};