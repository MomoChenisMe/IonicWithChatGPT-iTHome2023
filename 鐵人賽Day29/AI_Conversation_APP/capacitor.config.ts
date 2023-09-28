import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.momochenisme.aiconversationapp',
  appName: 'AI英語口說導師',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  //加入插件設定
  plugins: {
    //Splash Screen
    SplashScreen: {
      launchAutoHide: false //是否啟動後自動隱藏
    }
  }
};

export default config;
