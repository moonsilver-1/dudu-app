# 嘟嘟 DUDU — HDU Wiki 安卓阅读器

> DU = 电子科技大学（杭 H 省略）。本 App 复用 [`hdu-wiki-frontend`](../hdu-wiki-frontend) 网站的 **全部 131 篇 Markdown 内容**，在手机端提供与网站一致的阅读体验（含 KaTeX 公式、代码高亮、暗色模式）。

技术栈：**Expo (React Native) SDK 52**，纯离线、无需服务器，内容打包进安装包。

## 功能
- 🏠 首页：精选推荐 + 四大分类入口 + 搜索入口
- 🗂 分类 / 分卷浏览（courses/campus/tech/community）
- 📖 文章阅读：KaTeX 公式、代码高亮、目录抽屉(TOC)、上一篇/下一篇、阅读进度条
- 🔍 本地搜索（标题/标签/摘要/正文评分）+ 最近阅读
- ⭐ 收藏（本地，AsyncStorage）
- 🌗 浅色 / 深色 / 跟随系统
- 🐑 品牌吉祥物图标（🐑）

## 工程结构
```
scripts/build-content.mjs   # 复用网站渲染管线，生成 assets/content.json + src/lib/generatedStyles.ts
assets/content.json         # 文章元数据 + 正文 HTML + TOC + 分类/分卷结构
src/lib/generatedStyles.ts  # 自动生成：KaTeX(字体base64内联) + highlight 主题 + wiki-content CSS + KaTeX JS
src/theme.ts                # 设计系统（明暗双色板、圆角/间距/字号）
src/lib/content.ts          # 内容加载 + 本地搜索
src/lib/storage.ts          # AsyncStorage：收藏/进度/已读/主题
src/components/             # ArticleDocument(WebView) / ArticleCard / ui / SearchBar
src/screens/                # Home / Browse / Article / Search / Favorites / Settings
src/navigation/RootNavigator.tsx
```

## 开发 / 本地运行
```bash
npm install
npm run build:content   # 可选：内容已生成，内容更新时再跑
npx expo start          # 手机装 Expo Go 扫码，或连模拟器
```

## 内容更新
网站 `../hdu-wiki-frontend/content/*.md` 有变动时：
```bash
npm run build:content
```
重新打包即可（内容在构建期渲染为 HTML 打进 App）。

## 生成安卓 APK（两种方式）

### 方式一：EAS 云端构建（推荐，无需本机安卓环境）
```bash
npm install -g eas-cli
npx eas login                 # 用 Expo 账号登录（免费额度足够）
npx eas build -p android --profile preview   # 产出可安装的 .apk
```
构建完成后在 Expo 控制台 / 邮件拿到下载链接，直接安装到安卓手机。

### 方式二：本机 Android SDK 本地构建（可选）
安装 Android SDK（cmdline-tools + platform 34 + build-tools），配置 `ANDROID_HOME` 后：
```bash
npx expo prebuild -p android
cd android && ./gradlew assembleRelease   # 产出 app-release.apk
```

> 当前交付的工程已通过 `expo export --platform android` 完整打包验证（2482 模块全部编译通过）。
> 实际 APK 二进制需按上述方式之一生成（本机未预装 Android SDK / EAS 账号需你登录）。
