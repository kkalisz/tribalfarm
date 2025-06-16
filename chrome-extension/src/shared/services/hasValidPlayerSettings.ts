import { PlayerSettings } from '@src/shared/hooks/usePlayerSettings';

export function hasValidPlayerSettings(playerSettings: PlayerSettings): boolean {
  return !!playerSettings.login && !!playerSettings.password && !!playerSettings.world && !!playerSettings.server;
}