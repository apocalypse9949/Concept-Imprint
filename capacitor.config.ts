import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.company.ideatracker',
  appName: 'Concept Imprint',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true
    },
    CapacitorUpdater: {
      autoUpdate: true,
      stats: true
    }
  }
};

export default config;
