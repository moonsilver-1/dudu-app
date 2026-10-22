/**
 * 内容数据层 — 类型定义 + content.json 加载 + 本地搜索。
 * content.json 由 scripts/build-content.mjs 在构建期生成（复用网站渲染管线）。
 * 所有屏幕通过本模块读取文章，禁止自行重新解析 markdown。
 */
import contentJson from "../../assets/content.json";

// ---- 类型 ----
export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface ArticleMeta {
  slug: string;
  category: string;
  section: string;
  title: string;
  date?: string;
  author?: string;
  excerpt?: string;
  tags: string[];
  featured?: boolean;
  volumeKey?: string;
  volumeOrder?: number;
  readingTime?: number;
}

export interface Article extends ArticleMeta {
  html: string; // 已由网站同款管线渲染好的正文 HTML
  toc: TocItem[];
}

export interface Section {
  slug: string;
  name: string;
  articles: ArticleMeta[];
}

export interface CourseVolume {
  key: string;
  title: string;
  slugs: string[];
}

export interface CategoryGroup {
  slug: string;
  name: string;
  desc: string;
  articles: ArticleMeta[];
  sections: Section[];
}

export interface ContentData {
  schemaVersion: 1;
  version: string;
  generatedAt: string;
  articles: Article[];
  categories: Record<string, CategoryGroup>;
  courseVolumes: Record<string, CourseVolume[]>;
  featured: ArticleMeta[];
  total: number;
}

let data = contentJson as unknown as ContentData;
let articleIndex = new Map(data.articles.map(article => [article.slug, article]));
const searchBodies = new Map<string, string>();
export const getContentVersion = () => data.version;
export const getContentDate = () => data.generatedAt;
export function replaceContent(next: ContentData) {
  data = next;
  articleIndex = new Map(next.articles.map(article => [article.slug, article]));
  searchBodies.clear();
}
export const articleUrl = (article: Pick<ArticleMeta, 'category' | 'slug'>) =>
  `https://www.hdu-wiki.cn/${article.category}/${encodeURIComponent(article.slug)}`;


// ---- 访问器 ----
export const getAllArticles = (): Article[] => data.articles;
export const getArticleCount = (): number => data.total;

export const getArticle = (slug: string): Article | undefined =>
  articleIndex.get(slug);

export const getCategory = (slug: string): CategoryGroup | undefined =>
  data.categories[slug];

export const getCategories = (): CategoryGroup[] =>
  Object.values(data.categories);

export const getFeatured = (): ArticleMeta[] => data.featured;

export const getCourseVolumes = (category: string): CourseVolume[] =>
  data.courseVolumes[category] ?? [];

/** 同分类下一篇文章（用于「下一篇」） */
export const getAdjacent = (
  slug: string
): { prev?: ArticleMeta; next?: ArticleMeta } => {
  const article = articleIndex.get(slug);
  if (!article) return {};
  const flat = data.articles.filter(a => a.category === article.category && a.section === article.section);
  const idx = flat.findIndex((a) => a.slug === slug);
  if (idx === -1) return {};
  const prev = idx > 0 ? flat[idx - 1] : undefined;
  const next = idx < flat.length - 1 ? flat[idx + 1] : undefined;
  return { prev, next };
};

// ---- 本地搜索（轻量评分，无外部依赖） ----
export interface SearchHit {
  article: ArticleMeta;
  score: number;
  snippet: string;
}

const stripHtml = (html: string): string =>
  html
    .replace(/<math[\s\S]*?<\/math>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export const search = (query: string, limit = 30): SearchHit[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const hits: SearchHit[] = [];

  for (const article of data.articles) {
    const title = (article.title ?? "").toLowerCase();
    const excerpt = (article.excerpt ?? "").toLowerCase();
    const tags = (article.tags ?? []).join(" ").toLowerCase();
    let body = searchBodies.get(article.slug);
    if (body === undefined) { body = stripHtml(article.html).toLowerCase(); searchBodies.set(article.slug, body); }
    const cat = (article.category ?? "").toLowerCase();

    let score = 0;
    let matchedBodyIdx = -1;
    for (const t of terms) {
      if (title.includes(t)) score += 10;
      if (tags.includes(t)) score += 5;
      if (excerpt.includes(t)) score += 3;
      if (cat.includes(t)) score += 2;
      const bi = body.indexOf(t);
      if (bi >= 0) {
        score += 1;
        if (matchedBodyIdx === -1) matchedBodyIdx = bi;
      }
    }
    if (score <= 0) continue;

    let snippet = "";
    if (title.includes(q) && excerpt) {
      snippet = article.excerpt ?? "";
    } else if (matchedBodyIdx >= 0) {
      const start = Math.max(0, matchedBodyIdx - 30);
      snippet =
        (start > 0 ? "…" : "") +
        body.slice(start, start + 90) +
        "…";
    } else if (excerpt) {
      snippet = excerpt.slice(0, 90);
    }

    hits.push({ article, score, snippet });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
};
