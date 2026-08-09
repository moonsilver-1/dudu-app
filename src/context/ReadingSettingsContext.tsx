import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getReadingSettings,
  setReadingSettings,
  type ReadingSettings,
} from "../lib/storage";

/**
 * 阅读设置全局状态：字号、行距、护眼模式。
 * 在 ArticleScreen 和 ArticleDocument 里消费。
 * 改动后自动持久化到 AsyncStorage。
 */
interface Ctx {
  settings: ReadingSettings;
  update: (patch: Partial<ReadingSettings>) => void;
}
const ReadingSettingsContext = createContext<Ctx | null>(null);

export function ReadingSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ReadingSettings>({
    fontScale: 1,
    lineHeight: 1.9,
    eyeCare: false,
  });

  useEffect(() => {
    getReadingSettings().then(setSettings);
  }, []);

  const update = (patch: Partial<ReadingSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      setReadingSettings(next);
      return next;
    });
  };

  return (
    <ReadingSettingsContext.Provider value={{ settings, update }}>
      {children}
    </ReadingSettingsContext.Provider>
  );
}

export function useReadingSettings(): Ctx {
  const ctx = useContext(ReadingSettingsContext);
  if (!ctx) throw new Error("useReadingSettings 必须在 ReadingSettingsProvider 内使用");
  return ctx;
}
