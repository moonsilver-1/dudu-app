import { validateContent } from './content-validation';
import type { ContentData } from './content';

export async function fetchContentUpdate(currentVersion: string, fetcher: typeof fetch, base = 'https://www.hdu-wiki.cn') {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const manifestResponse = await fetcher(`${base}/api/mobile-content/manifest`, { signal: controller.signal });
    if (!manifestResponse.ok) throw new Error('暂时无法更新，已保留离线文章');
    const manifest = await manifestResponse.json() as { schemaVersion: number; version: string };
    if (manifest.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(manifest.version)) throw new Error('内容版本暂不兼容');
    if (manifest.version === currentVersion) return null;
    const response = await fetcher(`${base}/api/mobile-content`, { signal: controller.signal });
    if (!response.ok) throw new Error('文章下载失败，已保留离线文章');
    const text = await response.text();
    if (text.length > 40_000_000) throw new Error('内容包过大');
    const next: unknown = JSON.parse(text);
    validateContent(next);
    if (next.version !== manifest.version) throw new Error('网站正在更新，请稍后重试');
    return next as ContentData;
  } finally { clearTimeout(timeout); }
}
