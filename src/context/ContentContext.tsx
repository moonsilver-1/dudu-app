import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { getContentVersion, getContentDate, replaceContent } from '../lib/content';
import { validateContent } from '../lib/content-validation';
import { fetchContentUpdate } from '../lib/content-sync-core';

const cachePath = (version: string) => `${FileSystem.documentDirectory ?? ''}articles-${version}.json`;
const cacheKey = 'dudu:content-version';
const ContentContext = createContext({ version: '', updatedAt: '', refreshing: false, message: '', refresh: async () => {} });
export const useContent = () => useContext(ContentContext);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(getContentVersion);
  const [updatedAt, setUpdatedAt] = useState(getContentDate);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('内置文章可离线阅读');
  const busy = useRef(false);
  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true; setRefreshing(true);
    try {
      const next = await fetchContentUpdate(getContentVersion(), fetch);
      if (next) {
        // Persist a complete replacement before publishing it to the screens.
        if (Platform.OS !== 'web') {
          const oldVersion = await AsyncStorage.getItem(cacheKey);
          await FileSystem.writeAsStringAsync(cachePath(next.version), JSON.stringify(next));
          await AsyncStorage.setItem(cacheKey, next.version);
          if (oldVersion && /^[a-f0-9]{64}$/.test(oldVersion) && oldVersion !== next.version) {
            await FileSystem.deleteAsync(cachePath(oldVersion), { idempotent: true }).catch(() => {});
          }
        }
        replaceContent(next); setVersion(next.version); setUpdatedAt(next.generatedAt);
        setMessage(`已同步 ${next.total} 篇文章`);
      } else setMessage('文章已是最新');
    } catch (error) { setMessage(error instanceof Error ? error.message : '更新失败，仍可离线阅读'); }
    finally { busy.current = false; setRefreshing(false); }
  }, []);
  useEffect(() => {
    let alive = true;
    void (async () => {
      if (Platform.OS !== 'web') {
        try {
          const savedVersion = await AsyncStorage.getItem(cacheKey);
          if (!savedVersion || !/^[a-f0-9]{64}$/.test(savedVersion)) throw new Error('No cache');
          const saved: unknown = JSON.parse(await FileSystem.readAsStringAsync(cachePath(savedVersion)));
          validateContent(saved);
          if (alive && Date.parse(saved.generatedAt) >= Date.parse(getContentDate())) {
            replaceContent(saved); setVersion(saved.version); setUpdatedAt(saved.generatedAt);
          }
        } catch { /* Bundled content remains available when offline or cache is invalid. */ }
      }
      if (alive) void refresh();
    })();
    return () => { alive = false; };
  }, [refresh]);
  return <ContentContext.Provider value={{ version, updatedAt, refreshing, message, refresh }}>{children}</ContentContext.Provider>;
}
