// @ts-nocheck
/**
 * 内容构建脚本：复用网站同款渲染管线，把 ../hdu-wiki-frontend/content/*.md
 * 渲染成 assets/content.json（元数据 + 正文 HTML + TOC + 分类/分卷结构），
 * 并生成 src/lib/generatedStyles.ts（KaTeX 字体 base64 内联 + highlight 主题 + wiki-content CSS）。
 *
 * 运行方式：node scripts/build-content.mjs （复用网站 node_modules 里的 unified/remark/rehype/katex/highlight.js）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WEB = path.resolve(ROOT, "..", "hdu-wiki-frontend");
const WEB_NODE_MODULES = path.join(WEB, "node_modules");

const require = createRequire(import.meta.url);
const matter = require(path.join(WEB_NODE_MODULES, "gray-matter"));

// 让本脚本能 import 网站的 ESM 依赖（Windows 下需 file:// URL）
const importFromWeb = async (p) => {
  const mod = await import(pathToFileURL(path.join(WEB_NODE_MODULES, p)).href);
  // 这些 unified 生态包多为「具名导出即函数」，优先用具名，其次 default
  const name = p.split("/").pop().replace(/^@[^/]+\//, "").replace(/^(\.|index).*$/i, "");
  if (name && mod[name]) return mod[name];
  return mod.default ?? mod;
};

// 复用网站的分类/分卷定义。
// 网站 lib/content.ts 是 TS，Node 无法直接 import。改用「运行时从源码正则提取」
// 的方式拿到 courseVolumes，比硬编码 fallback 可靠（网站加卷时重跑本脚本即可同步）。
const webLib = path.join(WEB, "lib");
const { courseVolumes, CATEGORY_NAMES } = readWebContentMeta();

const CONTENT_DIR = path.join(WEB, "content");
const OUT_JSON = path.join(ROOT, "assets", "content.json");
const OUT_STYLES = path.join(ROOT, "src", "lib", "generatedStyles.ts");

const CATEGORY_DESC = {
  courses: "课程笔记 · 学术方法",
  campus: "吃喝玩乐 · 校园攻略",
  tech: "工程实践 · 工具技巧",
  community: "社团 · 竞赛征文",
};

// ---------- 渲染管线（与网站一致） ----------
const unifiedMod = await import(pathToFileURL(path.join(WEB_NODE_MODULES, "unified", "index.js")).href);
const unified = unifiedMod.unified ?? unifiedMod.default ?? unifiedMod;
const remarkParse = pick(await importFromWeb("remark-parse/index.js"));
const remarkGfm = pick(await importFromWeb("remark-gfm/index.js"));
const remarkMath = pick(await importFromWeb("remark-math/index.js"));
const remarkRehype = pick(await importFromWeb("remark-rehype/index.js"));
const rehypeRaw = pick(await importFromWeb("rehype-raw/index.js"));
const rehypeHighlight = pick(await importFromWeb("rehype-highlight/index.js"));
const rehypeStringify = pick(await importFromWeb("rehype-stringify/index.js"));

// 兼容 unified 生态「具名导出」与「default 导出」
function pick(mod) {
  if (typeof mod === "function") return mod;
  if (mod && typeof mod.default === "function") return mod.default;
  const fn = Object.values(mod).find((v) => typeof v === "function");
  return fn ?? mod;
}

// 公式不在构建期渲染，改为在 App 的 WebView 内用 KaTeX 运行时渲染（见 generatedStyles）
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeHighlight, { detect: true, ignoreMissing: true })
  .use(rehypeStringify, { allowDangerousHtml: true });

// ---------- 工具 ----------
function slugifyBasename(file, category, section) {
  // 去掉课程编号前缀（如 1.3- 或 A.2-），与网站保持一致
  const base = path.basename(file, ".md");
  return base.replace(/^(\d+\.\d+|[A-Z]\.\d+|\d+)-/, "");
}

function estimateReadingTime(markdown) {
  const words = markdown.replace(/\s+/g, " ").trim().length;
  return Math.max(1, Math.round(words / 350));
}

function buildToc(markdown) {
  const toc = [];
  const lines = markdown.split("\n");
  let inCode = false;
  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = /^(#{1,4})\s+(.*)$/.exec(line);
    if (m) {
      const level = m[1].length;
      const text = m[2].replace(/[#*`]/g, "").trim();
      if (!text) continue;
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9一-龥]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
      toc.push({ id, text, level });
    }
  }
  return toc;
}

// ---------- 遍历内容 ----------
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(p);
    return entry.isFile() && entry.name.endsWith(".md") ? [p] : [];
  });
}

const files = walk(CONTENT_DIR);
const articles = [];
const categories = {};
const featured = [];

/** 复刻网站 coursePlacement：返回某 slug 在其课程里的全局阅读顺序（globalIndex）。
 * 不在该课程卷结构里则返回 null。课程文章按此排序，非课程文章按日期。 */
const placementCache = new Map(); // "section/slug" -> globalIndex | null
function getPlacement(section, slug) {
  const key = section + "/" + slug;
  if (placementCache.has(key)) return placementCache.get(key);
  const vols = courseVolumes?.[section];
  if (!vols) {
    placementCache.set(key, null);
    return null;
  }
  let idx = 0;
  for (const vol of vols) {
    for (const s of vol.slugs) {
      if (s === slug) {
        placementCache.set(key, idx);
        return idx;
      }
      idx++;
    }
  }
  placementCache.set(key, null);
  return null;
}

for (const file of files) {
  const rel = path.relative(CONTENT_DIR, file);
  const parts = rel.split(path.sep);
  if (parts.length < 3) continue; // content/<cat>/<section>/<slug>.md
  const [category, section] = parts;
  const raw = fs.readFileSync(file, "utf-8");
  const { data: fm, content: md } = matter(raw);

  const slug = slugifyBasename(file, category, section);
  const title = fm.title ?? slug;
  const excerpt = fm.excerpt ?? "";
  const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : [];
  const author = fm.author ?? "";
  const date = fm.date ?? "";

  // 渲染 HTML
  let html = "";
  try {
    const processed = await processor.process(md);
    html = minifyHtml(String(processed));
  } catch (e) {
    console.warn("渲染失败:", file, e.message);
    html = `<p>${md.slice(0, 500)}</p>`;
  }

  const toc = buildToc(md);
  const meta = {
    slug,
    category,
    section,
    title,
    date,
    author,
    excerpt,
    tags,
    featured: Boolean(fm.featured),
    volumeKey: fm.volumeKey,
    volumeOrder: typeof fm.volumeOrder === "number" ? fm.volumeOrder : undefined,
    readingTime: estimateReadingTime(md),
  };
  articles.push({ ...meta, html, toc });

  // featured 文章 = 必读文章，单独归入 featured 分组，不重复进各分类
  // （与网站 getArticlesByCategory 过滤 featured 的逻辑一致）
  if (meta.featured) {
    featured.push(meta);
    continue;
  }

  if (!categories[category]) {
    categories[category] = {
      slug: category,
      name: CATEGORY_NAMES?.[category] ?? categoryDesc(category),
      desc: categoryDesc(category),
      articles: [],
      sections: [],
    };
  }
  categories[category].articles.push(meta);
  let sec = categories[category].sections.find((s) => s.slug === section);
  if (!sec) {
    sec = { slug: section, name: section, articles: [] };
    categories[category].sections.push(sec);
  }
  sec.articles.push(meta);
}

// 分卷
const courseVolumesOut = {};
for (const [cat, vols] of Object.entries(courseVolumes ?? {})) {
  courseVolumesOut[cat] = vols.map((v) => ({
    key: v.key,
    title: v.label ?? v.title,
    slugs: v.slugs,
  }));
}

// 给 section 起可读名字（用首个文章的目录推断或保留 slug）
for (const cat of Object.values(categories)) {
  for (const sec of cat.sections) {
    const knowns = {
      fundamentals: "基础课程",
      "deep-learning": "深度学习课程",
      algorithm: "算法课程",
      "campus-life": "校园生活",
      "forced-business": "被迫营业",
      "life-experience": "体验生活",
      engineering: "工程实践",
      "automation-learning": "自动化学习",
      "tool-use": "工具使用",
      vibecoding: "Vibecoding",
      other: "其他",
      community: "社团与活动",
      "science-fiction-contest": "科幻征文",
    };
    sec.name = knowns[sec.slug] ?? sec.slug;
  }
  // 排序：课程文章（section 在 courseVolumes 里）按卷顺序 globalIndex 排，
  // 非课程文章按日期倒序。复刻网站 sortArticles 逻辑。
  const sortArticle = (a, b) => {
    const pa = getPlacement(a.section, a.slug);
    const pb = getPlacement(b.section, b.slug);
    if (pa != null && pb != null) return pa - pb;
    if (pa != null) return -1;
    if (pb != null) return 1;
    return (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
  };
  cat.articles.sort(sortArticle);
  for (const sec of cat.sections) sec.articles.sort(sortArticle);
}

function categoryDesc(c) {
  return CATEGORY_DESC[c] ?? "";
}

const out = {
  generatedAt: new Date().toISOString(),
  articles,
  categories,
  courseVolumes: courseVolumesOut,
  featured,
  total: articles.length,
};

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(out));
console.log(`✓ content.json: ${articles.length} 篇文章`);

// ---------- 生成样式（katex 字体 base64 内联） ----------
generateStyles();

console.log("✓ generatedStyles.ts");
console.log("完成。");

// ---------- 样式生成 ----------
function generateStyles() {
  const katexDist = path.join(WEB_NODE_MODULES, "katex", "dist");
  let katexCss = fs.readFileSync(path.join(katexDist, "katex.min.css"), "utf-8");
  // 把字体引用改成 base64 data URI
  const fontDir = path.join(katexDist, "fonts");
  katexCss = katexCss.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g, (full, ref) => {
    const rel = ref.trim().replace(/^\.\//, "");
    const fontPath = path.join(katexDist, rel);
    if (fs.existsSync(fontPath)) {
      const b64 = fs.readFileSync(fontPath).toString("base64");
      const ext = path.extname(rel).slice(1);
      const mime =
        ext === "woff2"
          ? "font/woff2"
          : ext === "woff"
          ? "font/woff"
          : ext === "ttf"
          ? "font/ttf"
          : "application/octet-stream";
      return `url(data:${mime};base64,${b64})`;
    }
    return full;
  });

  const hlCss = fs.readFileSync(
    path.join(WEB_NODE_MODULES, "highlight.js", "styles", "github.css"),
    "utf-8"
  );
  const hlDarkCss = fs.readFileSync(
    path.join(WEB_NODE_MODULES, "highlight.js", "styles", "tokyo-night-dark.css"),
    "utf-8"
  );

  const wikiCss = readWikiCss();

  const katexJs = fs.readFileSync(
    path.join(katexDist, "katex.min.js"),
    "utf-8"
  );
  const autoRenderJs = fs.readFileSync(
    path.join(katexDist, "contrib", "auto-render.min.js"),
    "utf-8"
  );

  const ts = `// 自动生成，请勿手改。由 scripts/build-content.mjs 生成。
export const KATEX_CSS = ${JSON.stringify(katexCss)};
export const HIGHLIGHT_CSS = ${JSON.stringify(hlCss + "\n" + hlDarkCss)};
export const WIKI_CSS = ${JSON.stringify(wikiCss)};
export const KATEX_JS = ${JSON.stringify(katexJs)};
export const KATEX_AUTO_RENDER_JS = ${JSON.stringify(autoRenderJs)};
`;
  fs.mkdirSync(path.dirname(OUT_STYLES), { recursive: true });
  fs.writeFileSync(OUT_STYLES, ts);
}

function readWikiCss() {
  const globals = path.join(WEB, "app", "globals.css");
  const raw = fs.readFileSync(globals, "utf-8");
  // globals.css 里 .wiki-content 的样式是「一条条独立规则」
  // （.wiki-content h1 {…}、.wiki-content code {…} 共几十条），
  // 不是嵌套在一个 {} 里。需要把所有以 .wiki-content 开头的规则块都抓出来。
  // 思路：逐字符扫描，遇到选择器里含 ".wiki-content" 的规则，
  // 用括号配平取到它对应的 {} 块，累加。
  const rules = [];
  let i = 0;
  const n = raw.length;
  while (i < n) {
    const selStart = i;
    // 找到下一个 {
    const brace = raw.indexOf("{", i);
    if (brace < 0) break;
    // 选择器文本（从上一个 } 或文件头到这个 { 之间，去掉注释/空白）
    let selector = raw.slice(selStart, brace);
    // 去掉块注释 /* */
    selector = selector.replace(/\/\*[\s\S]*?\*\//g, "");
    // 选择器是否含 .wiki-content？（去掉 @media 等前置也判断）
    if (selector.includes(".wiki-content")) {
      // 用括号配平找到这个规则的结束 }
      let depth = 1;
      let j = brace + 1;
      // 处理嵌套 @media / 嵌套规则
      let bodyEnd = -1;
      while (j < n) {
        if (raw[j] === "{") depth++;
        else if (raw[j] === "}") {
          depth--;
          if (depth === 0) {
            bodyEnd = j + 1;
            break;
          }
        }
        j++;
      }
      if (bodyEnd > 0) {
        // 包含可能的前置 @media ... { 包装：取从 selStart 开始到 bodyEnd
        // 但要跳过开头的前导空白/注释，保留 @media 等包装器
        let ruleStart = selStart;
        // 跳过前导空白
        while (ruleStart < brace && /\s/.test(raw[ruleStart])) ruleStart++;
        rules.push(raw.slice(ruleStart, bodyEnd));
        i = bodyEnd;
        continue;
      }
    }
    // 否则跳过这个 { ... } 块（用括号配平）
    let depth = 1;
    let j = brace + 1;
    while (j < n && depth > 0) {
      if (raw[j] === "{") depth++;
      else if (raw[j] === "}") depth--;
      j++;
    }
    i = j;
  }
  return rules.join("\n").trim();
}

function minifyHtml(html) {
  return html
    .replace(/\n\s*\n/g, "\n")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ---------- 兜底元数据（当无法 import 网站 lib 时） ----------
/**
 * 从网站 lib/content.ts 源码运行时提取 courseVolumes 和分类名。
 * 比 import .ts 可靠（Node 不支持原生 TS）。网站加卷/改分类时重跑本脚本即可同步。
 */
function readWebContentMeta() {
  const tsPath = path.join(webLib, "content.ts");
  let courseVolumes = {};
  let CATEGORY_NAMES = {
    courses: "课程与学术",
    campus: "校园生活",
    tech: "技术与项目",
    community: "社团与活动",
  };
  if (fs.existsSync(tsPath)) {
    const src = fs.readFileSync(tsPath, "utf-8");
    // 提取 courseVolumes: Record<...> = { ... };
    const m = src.match(/export const courseVolumes[^=]*=\s*(\{[\s\S]*?\n\});/);
    if (m) {
      try {
        courseVolumes = (new Function("return " + m[1]))();
      } catch (e) {
        console.warn("提取 courseVolumes 失败，使用空分卷:", e.message);
      }
    }
    // 提取 CATEGORY_NAMES
    const mn = src.match(/export const CATEGORY_NAMES[^=]*=\s*(\{[\s\S]*?\n\});/);
    if (mn) {
      try {
        CATEGORY_NAMES = { ...CATEGORY_NAMES, ...(new Function("return " + mn[1]))() };
      } catch (e) {
        /* 用默认 */
      }
    }
  }
  return { courseVolumes, CATEGORY_NAMES };
}

function fallbackMeta() {
  const courseVolumes = {
    courses: [
      {
        key: "deep-learning",
        title: "深度学习课程",
        slugs: [],
      },
      {
        key: "algorithm",
        title: "算法课程",
        slugs: [],
      },
    ],
  };
  const CATEGORY_NAMES = {
    courses: "课程与学术",
    campus: "校园生活",
    tech: "技术与项目",
    community: "社团与活动",
  };
  return { courseVolumes, CATEGORY_NAMES };
}
