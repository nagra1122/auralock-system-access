export interface UserSettings {
  password: string;
  username: string;
  voiceCommand: string;
  pin: string;
  lockScreenMode: 'password' | 'pin' | 'both';
  theme: 'dark-blue' | 'matrix-green' | 'cyber-purple';
  soundEffects: boolean;
  vibration: boolean;
  voiceStyle: 'male' | 'female' | 'robotic';
  unlockAttempts: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  password: 'admin123',
  username: 'User',
  voiceCommand: '',
  pin: '123456',
  lockScreenMode: 'both',
  theme: 'dark-blue',
  soundEffects: true,
  vibration: true,
  voiceStyle: 'male',
  unlockAttempts: 0,
};

export const getSettings = (): UserSettings => {
  const stored = localStorage.getItem('auralock_settings');
  if (stored) {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: Partial<UserSettings>) => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem('auralock_settings', JSON.stringify(updated));
};

export const incrementAttempts = () => {
  const settings = getSettings();
  saveSettings({ unlockAttempts: settings.unlockAttempts + 1 });
};
