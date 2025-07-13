
export interface PlayerSettings {
  login: string;
  password: string;
  world: string;
  server: string;
  hasPremium: boolean;
}

export const defaultPlayerSettings: PlayerSettings = {
  login: '',
  password: '',
  world: '',
  server: '',
  hasPremium: false,
};

