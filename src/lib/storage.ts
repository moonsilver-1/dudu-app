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
