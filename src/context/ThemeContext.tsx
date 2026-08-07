import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import {
  paletteFor,
  type Palette,
  type ThemeMode,
} from "../theme";
import {
  getThemePref,
  setThemePref,
} from "../lib/storage";

type Pref = "light" | "dark" | "system";

interface ThemeContextValue {
  mode: ThemeMode; // 实际生效的 light/dark
  pref: Pref; // 用户偏好
  palette: Palette;
  isDark: boolean;
  setPref: (p: Pref) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [pref, setPrefState] = useState<Pref>("system");

  useEffect(() => {
    getThemePref().then((p) => setPrefState(p));
  }, []);

  const mode: ThemeMode =
    pref === "system" ? (systemScheme === "dark" ? "dark" : "light") : pref;

  const setPref = (p: Pref) => {
    setPrefState(p);
    setThemePref(p);
  };
  const toggle = () => setPref(mode === "dark" ? "light" : "dark");

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      pref,
      palette: paletteFor(mode),
      isDark: mode === "dark",
      setPref,
      toggle,
    }),
    [mode, pref]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme 必须在 ThemeProvider 内使用");
  return ctx;
}
