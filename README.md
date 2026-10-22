# dudu百科 — HDU Wiki 安卓阅读器

hdu-wiki项目的安卓 app，DU 就是 dianzi university。嘟嘟比较可爱所以就省略了 h。

## 📱 多端

| 平台 | 仓库 | 下载 |
|---|---|---|
| 🌐 网页 | [hdu-wiki-frontend](https://github.com/moonsilver-1/hdu-wiki-frontend) | [hdu-wiki.cn](https://www.hdu-wiki.cn) |
| 💻 桌面 | [hdu-wiki-desktop](https://github.com/moonsilver-1/hdu-wiki-desktop) | [下载 exe](https://github.com/moonsilver-1/hdu-wiki-desktop/releases/latest) |
| 📱 **安卓（本项目）** | [dudu-app](https://github.com/moonsilver-1/dudu-app) | [下载 APK](https://github.com/moonsilver-1/dudu-app/releases/latest) |

🏠 多端工作区：[newsheep2goat](https://github.com/moonsilver-1/newsheep2goat)
## 开发与验收

使用 Node.js 22：

```sh
npm ci
npm run typecheck
npm test
npm run check
```

`check` 包含类型检查、内容与阅读回归测试，以及 Android Hermes 和 Web 的生产 bundle 导出。网页预览使用 `npm run web`。原生运行使用 `npm run android`，需要本机 Java 和 Android SDK；bundle 导出不能代替 Android 真机验收。

## 同步网站文章

App 内置 302 篇文章，比原有 156 篇增加 146 篇。新版启动时检查网站内容版本，也可首页下拉刷新或在“我的 → 文章内容”手动同步。断网、下载不完整或版本不一致时保留原离线文章，收藏和阅读进度独立保存。

网站需部署 `/api/mobile-content/manifest` 和 `/api/mobile-content`（配套网站分支 `codex/article-quality`）。manifest 很小，只有版本变化才下载完整内容包。缓存使用独立文件，写完并校验后才切换版本；正文和公式可以离线阅读，外部图片仍需网络。

更新内置内容需要同级网站源码和已安装的网站依赖：

```sh
# 默认寻找 ../hdu-wiki-frontend 或 ../hdu-wiki-source
npm run build:content
# 其他目录通过 HDU_WEB_ROOT 环境变量指定
```

导出直接调用网站 `scripts/export-mobile.ts`，复用渲染器、分类、课程顺序与真实目录锚点；不再对代码空格压缩，也不再从源码正则提取分类。生成的 `assets/content.json` 和 `src/lib/generatedStyles.ts` 必须一并提交。

## 1.1.0 改进

- 新首页、双列分类入口、统一卡片、浅色/深色配色，以及更宽松的阅读布局。
- 修复目录点击不跳转、阅读百分比错误、分享链接 404、前后篇跨栏目、收藏不刷新、正文搜索被截断。
- 搜索正文缓存、Map 文章查找、输入延迟计算；阅读字体仅内嵌 WOFF2，样式体积从约 1.77 MB 降至 0.38 MB。
- 原生依赖对齐 Expo SDK 52；修复 debug/release 签名配置对调。发布版需提供 `DUDU_UPLOAD_STORE_*`、`DUDU_UPLOAD_KEY_*` Gradle 配置，使用原有签名以保留升级兼容性。

没有发布新的 APK 前，不更新根目录 `version.json` 下载通知。本轮完成源码和双平台 bundle 验证，正式发布还需原生安装、离线重启、系统分享、备份导入导出及升级验收。
