import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.4642be888a7f409d966a402b15997a5a',
  appName: 'auralock-system-access',
  webDir: 'dist',
  server: {
    url: 'https://4642be88-8a7f-409d-966a-402b15997a5a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
