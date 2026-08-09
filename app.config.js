import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "dudu百科",
  slug: "dudu",
  owner: "moonsilver-1s-team",
  scheme: "dudu",
  version: "1.0.3",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  newArchEnabled: false,
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
