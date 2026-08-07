import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "嘟嘟 DUDU",
  slug: "dudu-wiki",
  scheme: "dudu",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0B1220",
  },
  assetBundlePatterns: ["**/*"],
  ios: { supportsTablet: false, bundleIdentifier: "com.hduwiki.dudu" },
  android: {
    package: "com.hduwiki.dudu",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0B1220",
    },
    edgeToEdgeEnabled: true,
    softwareKeyboardLayoutMode: "resize",
  },
  web: { favicon: "./assets/favicon.png" },
  extra: {
    eas: { projectId: "0375bcc9-8616-4c70-903a-55faac26019b" },
  },
};

export default config;
