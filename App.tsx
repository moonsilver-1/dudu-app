import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { ReadingSettingsProvider } from "./src/context/ReadingSettingsContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { AppSplash } from "./src/components/AppSplash";

function Bar() {
  const { mode } = useTheme();
  return <StatusBar style={mode === "dark" ? "light" : "dark"} />;
}

export default function App() {
  const [splashVisible, setSplashVisible] = React.useState(true);
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <ReadingSettingsProvider>
            <RootNavigator />
            <Bar />
            {splashVisible ? <AppSplash onDone={() => setSplashVisible(false)} /> : null}
          </ReadingSettingsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
