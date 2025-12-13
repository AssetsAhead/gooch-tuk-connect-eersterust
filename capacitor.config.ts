import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.151b89e2eda149dfb8ebace47fd64286',
  appName: 'MojaRide',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://151b89e2-eda1-49df-b8eb-ace47fd64286.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ["camera", "photos"]
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;