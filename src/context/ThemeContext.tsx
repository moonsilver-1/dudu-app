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

type Pref = "light" | "dark" | "system" | "auto";

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
  // 用于触发 auto 模式按分钟重新计算
  const [tick, setTick] = useState(0);

  useEffect(() => {
    getThemePref().then((p) => setPrefState(p as Pref ?? "system"));
  }, []);

  // auto 模式：每分钟检查一次时间（20:00~07:00 深色）
  useEffect(() => {
    if (pref !== "auto") return;
    const timer = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(timer);
  }, [pref]);

  const isNightTime = () => {
    const h = new Date().getHours();
    return h >= 20 || h < 7; // 晚上 8 点到早上 7 点
  };

  const mode: ThemeMode =
    pref === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : pref === "auto"
      ? isNightTime()
        ? "dark"
        : "light"
      : (pref as ThemeMode);
  // tick 引用一下避免被 lint 当未使用（触发重新渲染）
  void tick;

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
