import React, { useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import WebView from "react-native-webview";
import { useTheme } from "../context/ThemeContext";
import { useReadingSettings } from "../context/ReadingSettingsContext";
import {
  KATEX_CSS,
  HIGHLIGHT_CSS,
  WIKI_CSS,
} from "../lib/generatedStyles";

/**
 * 文章正文渲染器：用 WebView 加载离线 HTML。
 * 样式 = KaTeX(字体已 base64 内联) + highlight 主题 + wiki-content CSS，
 * 公式在构建期由 rehype-katex 渲染为最终 HTML，运行时无需任何 JS。
 * 完全离线、与网站视觉效果一致。主题色随明暗模式切换。
 * 标题/作者/标签/正文 全部在一个 WebView 内渲染+滚动，
 * 这样能正确撑满高度（避免被外层 ScrollView 套住导致高度塌为 0）。
 */
interface Props {
  html: string;
  /** 标题/作者/阅读时长/标签——注入到 WebView 顶部，与正文一起渲染 */
  title: string;
  author?: string;
  readingTime?: number;
  tags?: string[];
  onScrollRatio?: (ratio: number) => void;
  onLinkPress?: (url: string) => void;
}

/** 文本转 HTML（防注入 + 换行）。undefined/null 安全。 */
const esc = (s?: string | null): string =>
  (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function ArticleDocument({
  html,
  title,
  author,
  readingTime,
  tags,
  onScrollRatio,
  onLinkPress,
}: Props) {
  const { palette, isDark } = useTheme();
  const { settings: reading } = useReadingSettings();
  const { width } = useWindowDimensions();

  const doc = useMemo(() => {
    // 护眼模式：米黄色背景 + 深棕文字（不跟暗色冲突，暗色下护眼无效）
    const eyeCareActive = reading.eyeCare && !isDark;
    const contentBg = eyeCareActive ? "#F5EBC6" : palette.contentBg;
    const foreground = eyeCareActive ? "#4A3A20" : palette.foreground;
    const themeVars = `
      html{font-size:${16 * reading.fontScale}px;}
      :root{
        --background:${palette.background};
        --surface:${palette.surface};
        --surface-muted:${eyeCareActive ? "#EBDFB4" : palette.surfaceMuted};
        --foreground:${foreground};
        --foreground-muted:${eyeCareActive ? "#6B5836" : palette.foregroundMuted};
        --border:${eyeCareActive ? "#D9C99A" : palette.border};
        --primary:${palette.primary};
        --primary-strong:${palette.primaryStrong};
        --content-bg:${contentBg};
      }
      body{background:var(--content-bg);color:var(--foreground);font-size:${16 * reading.fontScale}px;line-height:${reading.lineHeight};}
      .wiki-content{font-size:${16 * reading.fontScale}px;line-height:${reading.lineHeight};}
      .wiki-content pre{background:${isDark ? "#0e1117" : eyeCareActive ? "#EBDFB4" : palette.surfaceMuted};}
      .wiki-content code{background:${isDark ? "rgba(255,255,255,0.06)" : eyeCareActive ? "rgba(74,58,32,0.1)" : palette.surfaceMuted};}
      .wiki-content blockquote{border-left:4px solid var(--primary);background:var(--surface-muted);}
      /* 文章头部（标题/作者/标签）—— 注入到 WebView 里渲染 */
      .article-head{padding:0 0 12px;margin-bottom:8px;border-bottom:1px solid var(--border);}
      .article-head h1{margin:0 0 8px;font-size:${1.7 * reading.fontScale}rem;line-height:1.35;font-weight:800;color:var(--foreground);}
      .article-meta{display:flex;flex-wrap:wrap;gap:14px;color:var(--foreground-muted);font-size:13px;margin-top:4px;}
      .article-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
      .article-tag{font-size:12px;padding:2px 10px;border-radius:999px;background:var(--surface-muted);color:var(--foreground-muted);}
      body{padding:14px 16px 64px;}
    `;
    // 文章头部 HTML
    const metaBits: string[] = [];
    if (author) metaBits.push(`<span>✍ ${esc(author)}</span>`);
    if (readingTime) metaBits.push(`<span>⏱ ${readingTime} 分钟</span>`);
    const tagsHtml = (tags && tags.length)
      ? `<div class="article-tags">${tags.map((t) => `<span class="article-tag">${esc(t)}</span>`).join("")}</div>`
      : "";
    const head = `
      <div class="article-head">
        <h1>${esc(title)}</h1>
        ${metaBits.length ? `<div class="article-meta">${metaBits.join("")}</div>` : ""}
        ${tagsHtml}
      </div>
    `;
    const body = `${head}<article class="wiki-content">${html}</article>`;
    // 公式已在构建期由 rehype-katex 渲染为最终 HTML（与网站一致），
    // 这里不再做运行时渲染 —— 运行时方案会被 code 标签忽略导致公式不显示。
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>${KATEX_CSS}${HIGHLIGHT_CSS}${WIKI_CSS}${themeVars}</style>
</head>
<body>${body}
<script>
(function(){
  function post(){ window.ReactNativeWebView.postMessage('scroll:'+window.scrollY); }
  window.addEventListener('scroll', post, {passive:true});
  document.addEventListener('click', function(e){
    var a = e.target.closest('a');
    if(a && a.href){ e.preventDefault(); window.ReactNativeWebView.postMessage('link:'+a.href); }
  });
})();
</script></body></html>`;
  }, [html, title, author, readingTime, tags, palette, isDark]);

  return (
    <View style={{ flex: 1, width }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: doc }}
        style={{ flex: 1, backgroundColor: palette.contentBg }}
        onMessage={(e) => {
          const msg = e.nativeEvent.data as string;
          if (msg.startsWith("scroll:")) {
            onScrollRatio?.(Number(msg.slice(7)) || 0);
          } else if (msg.startsWith("link:")) {
            onLinkPress?.(msg.slice(5));
          }
        }}
        scrollEnabled
        showsVerticalScrollIndicator
        decelerationRate="normal"
        androidLayerType="hardware"
      />
    </View>
  );
}
