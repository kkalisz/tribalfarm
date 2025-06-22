import React, {createContext, useContext, ReactNode, useMemo, useState, useEffect} from 'react';
import { SettingsStorageService } from '@src/shared/services/settingsStorage';
import { getGameUrlInfo } from '@src/shared/helpers/getGameUrlInfo';
import {useCurrentTabUrl} from "@src/shared/hooks/useCurrentTabUrl";
import {ProxyIDBPDatabase} from "@src/shared/db/ProxyIDBPDatabase";
import {GameDataBaseAccess} from "@src/shared/db/GameDataBaseAcess";
import {GameDatabaseClientSync} from "@src/shared/db/GameDatabaseClientSync";

// Create the context with a default undefined value
export const StorageContext = createContext<SettingsStorageService | undefined>(undefined);

export const GameDatabaseContext = createContext<GameDataBaseAccess | undefined>(undefined);

// Props for the provider component
interface SettingsStorageProviderProps {
  children: ReactNode;
  useTabsApi: boolean;
  domain?: string; // Optional domain override
}

/**
 * Provider component that makes the SettingsStorageService available to any
 * child component that calls the useSettingsStorage hook.
 */
export const StorageProvider: React.FC<SettingsStorageProviderProps> = ({
  children,
  useTabsApi,
  domain 
}) => {
  // Get the domain from the URL or use the provided domain
  const [gameDatabase, setGameDatabase] = useState<GameDataBaseAccess | null>(null);

  const currentTabUrl = useCurrentTabUrl(useTabsApi);
  const gameUrlInfo = useMemo(() => {
    return getGameUrlInfo(currentTabUrl ?? window.location.href);
  }, [window.location.href, currentTabUrl]);

  // Create the settings service instance
  const settingsService = useMemo(() => {
    const domainToUse = domain || gameUrlInfo.fullDomain || "";
    return new SettingsStorageService(domainToUse);
  }, [domain, gameUrlInfo.fullDomain]);

   useEffect(() => {
    const domainToUse = domain || gameUrlInfo.fullDomain || "";
    if(domainToUse){
      const dataBase = new ProxyIDBPDatabase(new GameDatabaseClientSync(domainToUse));
      setGameDatabase(new GameDataBaseAccess(dataBase)); // Update state if still mounted
    }
    }, [domain, gameUrlInfo.fullDomain]);

   if(!gameDatabase){
     return null;
   }


  return (
    <StorageContext.Provider value={settingsService}>
      <GameDatabaseContext.Provider value={gameDatabase}>
        {children}
      </GameDatabaseContext.Provider>
    </StorageContext.Provider>
  );
};

/**
 * Custom hook to use the SettingsStorageService from the context
 * @returns The SettingsStorageService instance
 * @throws Error if used outside of a SettingsStorageProvider
 */
export const useSettingsStorage = (): SettingsStorageService => {
  const context = useContext(StorageContext);
  
  if (context === undefined) {
    throw new Error('useSettingsStorage must be used within a SettingsStorageProvider');
  }
  
  return context;
};

export const useGameDatabase = (): GameDataBaseAccess => {
  const context = useContext(GameDatabaseContext);

  if (context === undefined) {
    throw new Error('useGameDatabase must be used within a GameDatabaseContext');
  }

  return context;
};