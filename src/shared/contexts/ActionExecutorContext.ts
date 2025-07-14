import { createContext, useContext } from 'react';
import { ContentActionExecutor } from '@pages/content/execute/ContentActionExecutor';

// Create the context with a default undefined value
export const ActionExecutorContext = createContext<ContentActionExecutor | undefined>(undefined);

export const useActionExecutorContext = (): ContentActionExecutor => {
  const context = useContext(ActionExecutorContext);

  if (context === undefined) {
    throw new Error('useActionExecutorContext must be used within a Provider');
  }

  return context;
};