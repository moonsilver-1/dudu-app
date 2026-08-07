# DUDU（嘟嘟）安卓 App 实施计划

> 基于现有 HDU Wiki 网站（`hdu-wiki-frontend`）的内容，做一个安卓端阅读器 App。
> DU = 电子科技大学（杭 H 省略）。内容复用 `content/*.md`，渲染效果与网站一致。

## 范围决策
- **做**：首页、分类/分卷浏览、文章阅读（目录/TOC、上下篇、收藏、阅读进度、分享、暗黑模式）、本地搜索、收藏夹、设置。
- **不做投稿**（环境/稳健性考量，用户已同意可省略）。
- **目标产物**：可在安卓安装的 APK。优先走 Expo EAS 云端 `preview` 构建出 APK；若本机可装 Android SDK 则本地构建兜底。

## 技术方案
- **Expo (React Native) SDK 52**，与现有 React 技术栈一致，代码风格接近。
- **内容复用**：用 Node 脚本（`scripts/build-content.mjs`）复用网站的 unified/remark/rehype 渲染管线，
  把 `content/*.md` 在构建期渲染成 HTML，输出 `assets/content.json`（元数据+正文HTML+结构）。
- **文章渲染**：App 内用 `WebView` 加载「KaTeX CSS(内联base64字体) + highlight 主题 + wiki-content CSS + 正文HTML」组成的离线 HTML，**完全离线、效果与网站一致**。
- **数据**：`content.json` 作为 JSON asset 直接 import；收藏/进度/设置用 `AsyncStorage`。
- **导航**：底部 Tab（首页/分类/搜索/收藏/设置）+ 文章详情页（stack）。

## 工程位置
`d:/coding/newsheep2goat/dudu-app`（与网站同级，构建脚本读取 `../hdu-wiki-frontend/content`）

## 多智能体协作分工
1. **主编排（我）**：搭骨架——package.json / app.json / eas.json / tsconfig / babel、theme 设计系统、
   content 加载与搜索、AsyncStorage 封装、WebView 文档组件、导航、共享 UI 组件、内容构建脚本 + 资源提取、跑通构建脚本。
2. **智能体 A（浏览）**：首页 HomeScreen + 分类/分卷 BrowseScreen + CategoryCard/VolumeCard。
3. **智能体 B（阅读）**：文章详情 ArticleScreen（TOC 抽屉、上下篇、收藏、进度、分享）。
4. **智能体 C（搜索/收藏/设置）**：SearchScreen、FavoritesScreen、SettingsScreen（暗黑切换/关于）。

各智能体只写自己负责的 screen 文件，严格复用我定义好的 theme/content/组件 API。完成后我统一集成、类型检查、修复。

## 安卓环境
- 尝试安装：Node(已有 v22)、Expo CLI、EAS CLI、Android SDK（cmdline-tools + 平台/构建工具）。
- 若本机装 SDK 不可行 → 配置 `eas.json`，用户执行 `npx eas login && npx eas build -p android --profile preview` 云端拿 APK。

## 交付
- 完整可构建的 Expo 工程 + 已生成的 `content.json` / 样式。
- `README.md`：如何本地跑、如何出 APK。
- 尝试实际产出 APK（取决于环境）。
