import React, { useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import WebView from "react-native-webview";
import { useTheme } from "../context/ThemeContext";
import {
  KATEX_CSS,
  HIGHLIGHT_CSS,
  WIKI_CSS,
  KATEX_JS,
  KATEX_AUTO_RENDER_JS,
} from "../lib/generatedStyles";

/**
 * 文章正文渲染器：用 WebView 加载离线 HTML。
 * 样式 = KaTeX(字体已 base64 内联) + highlight 主题 + wiki-content CSS，
 * 完全离线、与网站视觉效果一致。主题色随明暗模式切换。
 */
interface Props {
  html: string;
  onScrollRatio?: (ratio: number) => void;
  onLinkPress?: (url: string) => void;
}

const escapeForTemplate = (s: string) => s; // 样式已是安全字符串

export function ArticleDocument({ html, onScrollRatio, onLinkPress }: Props) {
  const { palette, isDark } = useTheme();
  const { width } = useWindowDimensions();

  const doc = useMemo(() => {
    const themeVars = `
      :root{
        --background:${palette.background};
        --surface:${palette.surface};
        --surface-muted:${palette.surfaceMuted};
        --foreground:${palette.foreground};
        --foreground-muted:${palette.foregroundMuted};
        --border:${palette.border};
        --primary:${palette.primary};
        --primary-strong:${palette.primaryStrong};
        --content-bg:${palette.contentBg};
      }
      body{background:var(--content-bg);color:var(--foreground);}
      .wiki-content pre{background:${isDark ? "#0e1117" : palette.surfaceMuted};}
      .wiki-content code{background:${isDark ? "rgba(255,255,255,0.06)" : palette.surfaceMuted};}
      .wiki-content blockquote{border-left:4px solid var(--primary);background:var(--surface-muted);}
      .wiki-content code.language-math{background:none;padding:0;font-family:${"var(--foreground)"};}
    `;
    const body = `
      <article class="wiki-content">${html}</article>
    `;
    const renderScript = `
      (function(){
        function renderMath(){
          if(window.renderMathInElement){
            renderMathInElement(document.body, {
              delimiters: [
                {left:'$$',right:'$$',display:true},
                {left:'$',right:'$',display:false},
                {left:'\\\\(',right:'\\\\)',display:false},
                {left:'\\\\[',right:'\\\\]',display:true}
              ],
              ignoredTags:['script','noscript','style','textarea','pre','code'],
              throwOnError:false
            });
          }
        }
        if(document.readyState!=='loading') renderMath();
        else document.addEventListener('DOMContentLoaded', renderMath);
      })();
    `;
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>${KATEX_CSS}${HIGHLIGHT_CSS}${WIKI_CSS}${themeVars}</style>
<script>${KATEX_JS}</script>
<script>${KATEX_AUTO_RENDER_JS}</script>
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
  ${renderScript}
})();
</script></body></html>`;
  }, [html, palette, isDark]);

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
