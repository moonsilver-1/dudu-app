/** Export the website's tested renderer and taxonomy, then bundle offline styles. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB = process.env.HDU_WEB_ROOT ? path.resolve(process.env.HDU_WEB_ROOT) :
  ["hdu-wiki-frontend", "hdu-wiki-source"].map(name => path.resolve(ROOT, "..", name)).find(dir => fs.existsSync(path.join(dir, "scripts/export-mobile.ts")));
if (!WEB) throw new Error("Set HDU_WEB_ROOT to the current HDU Wiki checkout with scripts/export-mobile.ts.");
const WEB_NODE_MODULES = path.join(WEB, "node_modules");
const OUT_STYLES = path.join(ROOT, "src/lib/generatedStyles.ts");
const webRequire = createRequire(path.join(WEB, "package.json"));
execFileSync(process.execPath, [webRequire.resolve("tsx/cli"), "scripts/export-mobile.ts", path.join(ROOT, "assets/content.json")], {cwd:WEB, stdio:"inherit"});
generateStyles();
console.log("Offline styles generated.");
function generateStyles() {
  const katexDist = path.join(WEB_NODE_MODULES, "katex", "dist");
  let katexCss = fs.readFileSync(path.join(katexDist, "katex.min.css"), "utf-8");
  // 把字体引用改成 base64 data URI
  katexCss = katexCss.replace(/src:[^;}]+/g, source => {
    const woff2 = source.match(/url\([^)]+\.woff2\)\s*format\([^)]+\)/);
    return woff2 ? `src:${woff2[0]}` : source;
  });
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

  const darkRoot = createRequire(webRequire.resolve("next/package.json"))("postcss").parse(hlDarkCss);
  darkRoot.walkRules(rule => { rule.selectors = rule.selectors.map(selector => `.dark ${selector}`); });
  const ts = `// 自动生成，请勿手改。由 scripts/build-content.mjs 生成。
export const KATEX_CSS = ${JSON.stringify(katexCss)};
export const HIGHLIGHT_CSS = ${JSON.stringify(hlCss + "\n" + darkRoot.toString())};
export const WIKI_CSS = ${JSON.stringify(wikiCss)};
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
