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

// 复用网站的分类/分卷定义
const webLib = path.join(WEB, "lib");
const { courseVolumes, CATEGORY_NAMES } = await import(
  path.join(webLib, "content.ts").replace(/\.ts$/, ".mjs")
).catch(async () => {
  // 退回：直接读 ts 源码不便，这里硬编码与网站一致的常量（见 README 说明）
  return fallbackMeta();
});

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

  if (meta.featured) featured.push(meta);

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
    title: v.title,
    slugs: v.slugs,
  }));
}

// 给 section 起可读名字（用首个文章的目录推断或保留 slug）
for (const cat of Object.values(categories)) {
  for (const sec of cat.sections) {
    const knowns = {
      fundamentals: "基础课程",
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
  cat.articles.sort((a, b) => (a.date < b.date ? 1 : -1));
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
  const start = raw.indexOf(".wiki-content");
  if (start < 0) return "";
  // 用括号配平只取 .wiki-content { ... } 这一整块
  let i = raw.indexOf("{", start);
  if (i < 0) return "";
  let depth = 0;
  let end = -1;
  for (let j = i; j < raw.length; j++) {
    if (raw[j] === "{") depth++;
    else if (raw[j] === "}") {
      depth--;
      if (depth === 0) {
        end = j + 1;
        break;
      }
    }
  }
  if (end < 0) return "";
  let css = raw.slice(start, end);
  // 去掉可能的 @layer 包裹前缀（保留内部规则）
  css = css.replace(/@layer\s+[\w-]+\s*\{/, "").replace(/\}\s*$/, "");
  return css.trim();
}

function minifyHtml(html) {
  return html
    .replace(/\n\s*\n/g, "\n")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ---------- 兜底元数据（当无法 import 网站 lib 时） ----------
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
