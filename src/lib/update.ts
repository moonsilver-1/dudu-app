/**
 * 检查更新模块：从 GitHub（走 jsDelivr CDN，国内访问快）读取 version.json，
 * 跟本地版本号对比，提示用户下载新版 APK。
 *
 * version.json 放在仓库根目录，通过 jsDelivr CDN 访问：
 *   https://cdn.jsdelivr.net/gh/moonsilver-1/dudu-app@master/version.json
 * APK 下载链接直接走 GitHub Release（version.json 里的 url 字段）。
 */

/** 本地版本（跟 android/app/build.gradle 的 versionCode/versionName 保持一致） */
export const LOCAL_VERSION = "1.0.3";
export const LOCAL_VERSION_CODE = 4;

/** 版本信息源（jsDelivr CDN，国内友好。带时间戳防缓存） */
const VERSION_URL =
  "https://cdn.jsdelivr.net/gh/moonsilver-1/dudu-app@master/version.json?t=" +
  Date.now();

export interface RemoteVersion {
  version: string;
  versionCode: number;
  url: string;
  changelog?: string;
}

export interface CheckResult {
  hasUpdate: boolean;
  remote?: RemoteVersion;
  error?: string;
}

/** 检查是否有新版本。超时 8 秒。 */
export async function checkForUpdate(): Promise<CheckResult> {
  try {
    const ctrl = { aborted: false };
    const timer = setTimeout(() => (ctrl.aborted = true), 8000);
    const res = await fetch(VERSION_URL, {
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);
    if (ctrl.aborted) return { hasUpdate: false, error: "网络超时" };
    if (!res.ok) return { hasUpdate: false, error: `服务器返回 ${res.status}` };
    const remote = (await res.json()) as RemoteVersion;
    // versionCode 数值比较（更可靠）
    const hasUpdate =
      (remote.versionCode ?? 0) > LOCAL_VERSION_CODE ||
      isNewerVersion(remote.version, LOCAL_VERSION);
    return { hasUpdate, remote };
  } catch (e: any) {
    return { hasUpdate: false, error: String(e?.message || e || "未知错误") };
  }
}

/** 语义化版本字符串比较：remote > local 返回 true */
function isNewerVersion(remote: string, local: string): boolean {
  const r = remote.split(".").map((n) => parseInt(n, 10) || 0);
  const l = local.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const ri = r[i] ?? 0;
    const li = l[i] ?? 0;
    if (ri > li) return true;
    if (ri < li) return false;
  }
  return false;
}
