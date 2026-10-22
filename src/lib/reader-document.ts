import type { Palette } from '../theme';
import type { ReadingSettings } from './storage';
import { KATEX_CSS, HIGHLIGHT_CSS, WIKI_CSS } from './generatedStyles';

export interface ReaderProps {
  html: string; title: string; author?: string; readingTime?: number; tags?: string[];
  initialProgress?: number; onScrollRatio?: (ratio: number) => void; onLinkPress?: (url: string) => void;
}
export interface ReaderHandle { scrollToAnchor: (id: string) => void }
export const scrollRatio = (offset: number, total: number, viewport: number) =>
  total <= viewport ? 1 : Math.max(0, Math.min(1, offset / (total - viewport)));
const escape = (text = '') => text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export function buildReaderDocument(props: ReaderProps, palette: Palette, dark: boolean, reading: ReadingSettings) {
  const eye = reading.eyeCare && !dark;
  const bg = eye ? '#F5EEDB' : palette.contentBg;
  const fg = eye ? '#463B2D' : palette.foreground;
  return `<!doctype html><html lang="zh-CN" class="${dark?'dark':''}"><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; font-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri https://www.hdu-wiki.cn;">
<base href="https://www.hdu-wiki.cn/">
<style>${KATEX_CSS}${HIGHLIGHT_CSS}${WIKI_CSS}
:root{--background:${bg};--surface:${bg};--surface-muted:${palette.surfaceMuted};--foreground:${fg};--muted:${palette.foregroundMuted};--border:${palette.border};--primary:${palette.primary};--primary-light:${palette.primarySoft};color-scheme:${dark?'dark':'light'}}
*{box-sizing:border-box}html{font-size:${16*reading.fontScale}px;scroll-behavior:smooth}body{margin:0;padding:28px 22px 70px;background:${bg};color:${fg};font-family:system-ui,-apple-system,sans-serif;overflow-wrap:anywhere}
main{max-width:760px;margin:auto}.article-head{padding-bottom:24px;margin-bottom:30px;border-bottom:1px solid var(--border)}.article-eyebrow{font-size:10px;letter-spacing:2px;color:var(--primary);font-weight:700;margin-bottom:16px}
h1{font-size:1.8rem;line-height:1.4;letter-spacing:-.5px;margin:0 0 16px;font-weight:800}.article-meta{font-size:12px;color:var(--muted);line-height:1.8}.article-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:16px}.article-tag{background:var(--surface-muted);color:var(--muted);padding:3px 10px;border-radius:6px;font-size:11px}
.wiki-content{width:100%;font-size:1rem;line-height:${reading.lineHeight};padding:0;color:${fg}}.wiki-content p{line-height:inherit}.wiki-content h2{font-size:1.35rem;margin-top:2em;line-height:1.5}.wiki-content h3{font-size:1.15rem}.wiki-content :is(h2,h3,h4,h5,h6) a{color:inherit;text-decoration:none}.wiki-content pre{font-size:.82rem;background:var(--surface-muted)}.wiki-content img{height:auto;max-width:100%;border-radius:12px}.wiki-content .katex-display{overflow-x:auto;overflow-y:hidden}.wiki-content .katex-display>.katex>.katex-html{overflow:visible}.wiki-content h2,.wiki-content h3,.wiki-content h4{scroll-margin-top:20px}
</style></head><body><main><header class="article-head"><div class="article-eyebrow">DUDU / 阅读时光</div><h1>${escape(props.title)}</h1><div class="article-meta">${escape(props.author)}${props.readingTime?' · '+props.readingTime+' 分钟阅读':''}</div><div class="article-tags">${(props.tags??[]).map(t=>`<span class="article-tag">${escape(t)}</span>`).join('')}</div></header><article class="wiki-content">${props.html}</article></main>
<script>(function(){
function send(value){if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(value)}else{window.parent.postMessage({source:'dudu-reader',value:value},'*')}}
var timer;function post(){clearTimeout(timer);timer=setTimeout(function(){var max=document.documentElement.scrollHeight-window.innerHeight;send('scroll:'+ (max<=0?1:Math.max(0,Math.min(1,window.scrollY/max))))},150)}
window.addEventListener('scroll',post,{passive:true});
document.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;var raw=a.getAttribute('href')||'';e.preventDefault();if(raw.charAt(0)==='#'){try{var target=document.getElementById(decodeURIComponent(raw.slice(1)));if(target)target.scrollIntoView()}catch(_){}return}if(/^https?:/i.test(a.href))send('link:'+a.href)});
window.duduScroll=function(ratio){window.scrollTo(0,Math.max(0,document.documentElement.scrollHeight-window.innerHeight)*ratio)};
window.duduAnchor=function(id){var target=document.getElementById(id);if(target)target.scrollIntoView()};
})();</script></body></html>`;
}
