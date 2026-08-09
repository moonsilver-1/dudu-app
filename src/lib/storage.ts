/**
 * 本地持久化封装 — 基于 AsyncStorage。
 * 负责：收藏、阅读进度（滚动百分比）、已读标记、草稿、主题偏好。
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  favorites: "dudu:favorites",
  progress: "dudu:progress",
  read: "dudu:read",
  theme: "dudu:theme",
  drafts: "dudu:drafts",
};

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 忽略写入错误 */
  }
}

// ---- 收藏 ----
export const getFavorites = (): Promise<string[]> => readJSON(KEYS.favorites, []);
export async function isFavorite(slug: string): Promise<boolean> {
  const favs = await getFavorites();
  return favs.includes(slug);
}
export async function toggleFavorite(slug: string): Promise<boolean> {
  const favs = await getFavorites();
  const set = new Set(favs);
  const nowFav = set.has(slug);
  if (nowFav) set.delete(slug);
  else set.add(slug);
  await writeJSON(KEYS.favorites, Array.from(set));
  return !nowFav;
}

// ---- 阅读进度（0~1）与已读 ----
export async function setProgress(slug: string, ratio: number): Promise<void> {
  const all = await readJSON<Record<string, number>>(KEYS.progress, {});
  all[slug] = Math.max(all[slug] ?? 0, Math.min(1, ratio));
  await writeJSON(KEYS.progress, all);
  if ((all[slug] ?? 0) > 0.85) {
    const read = await readJSON<string[]>(KEYS.read, []);
    if (!read.includes(slug)) {
      read.push(slug);
      await writeJSON(KEYS.read, read);
    }
  }
}
export const getProgress = (): Promise<Record<string, number>> =>
  readJSON(KEYS.progress, {});
export const getReadSet = (): Promise<string[]> => readJSON(KEYS.read, []);

// ---- 主题偏好 ----
export const getThemePref = (): Promise<"light" | "dark" | "system"> =>
  readJSON<"light" | "dark" | "system">(KEYS.theme, "system");
export const setThemePref = (mode: "light" | "dark" | "system"): Promise<void> =>
  writeJSON(KEYS.theme, mode);

// ---- 阅读设置（字号/行距/护眼） ----
export interface ReadingSettings {
  fontScale: number; // 0.85(小) / 1.0(中) / 1.15(大) / 1.3(超大)
  lineHeight: number; // 1.6 / 1.8 / 2.0
  eyeCare: boolean; // 护眼模式（米黄背景）
}
const DEFAULT_SETTINGS: ReadingSettings = { fontScale: 1, lineHeight: 1.9, eyeCare: false };
export const getReadingSettings = (): Promise<ReadingSettings> =>
  readJSON<ReadingSettings>("dudu:reading", DEFAULT_SETTINGS);
export const setReadingSettings = (s: ReadingSettings): Promise<void> =>
  writeJSON("dudu:reading", s);

// ---- 导出/导入备份 ----
export interface BackupData {
  version: 1;
  exportedAt: string;
  favorites: string[];
  progress: Record<string, number>;
  read: string[];
  readingSettings?: ReadingSettings;
  themePref?: string;
}

/** 把所有本地数据打包成备份对象 */
export async function exportBackup(): Promise<BackupData> {
  const [favorites, progress, read, readingSettings, themePref] = await Promise.all([
    getFavorites(),
    getProgress(),
    getReadSet(),
    getReadingSettings(),
    getThemePref(),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    favorites,
    progress,
    read,
    readingSettings,
    themePref,
  };
}

/** 从备份对象恢复所有本地数据 */
export async function importBackup(data: BackupData): Promise<void> {
  if (!data || data.version !== 1) throw new Error("备份文件格式不正确");
  if (Array.isArray(data.favorites)) await writeJSON(KEYS.favorites, data.favorites);
  if (data.progress && typeof data.progress === "object")
    await writeJSON(KEYS.progress, data.progress);
  if (Array.isArray(data.read)) await writeJSON(KEYS.read, data.read);
  if (data.readingSettings) await writeJSON("dudu:reading", data.readingSettings);
  if (data.themePref) await writeJSON(KEYS.theme, data.themePref);
}

// ---- 投稿草稿（若将来启用投稿） ----
export type Draft = Record<string, unknown> & { updatedAt: number };
export const getDrafts = (): Promise<Draft[]> => readJSON<Draft[]>(KEYS.drafts, []);
export const saveDraft = async (draft: Draft): Promise<void> => {
  const drafts = await getDrafts();
  const idx = drafts.findIndex((d) => d.key === draft.key);
  if (idx >= 0) drafts[idx] = draft;
  else drafts.push(draft);
  await writeJSON(KEYS.drafts, drafts);
};
