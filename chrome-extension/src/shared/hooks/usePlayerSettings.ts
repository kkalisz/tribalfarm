
export interface PlayerSettings {
  login: string;
  password: string;
  world: string;
  server: string;
}

export const defaultPlayerSettings: PlayerSettings = {
  login: '',
  password: '',
  world: '',
  server: ''
};

