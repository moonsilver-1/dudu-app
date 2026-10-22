import type { ContentData } from './content';

export function validateContent(value: unknown): asserts value is ContentData {
  if (!value || typeof value !== 'object') throw new Error('内容包格式不正确');
  const data = value as ContentData;
  if (typeof data.generatedAt !== 'string' || !Number.isFinite(Date.parse(data.generatedAt)) || data.schemaVersion !== 1 || typeof data.version !== 'string' || !/^[a-f0-9]{64}$/.test(data.version)
    || !data.categories || !['courses','campus','tech','community'].every(key=>data.categories[key]) || !Array.isArray(data.articles) || !data.articles.length || data.articles.length > 10000
    || data.total !== data.articles.length || !data.categories || !data.courseVolumes || !Array.isArray(data.featured)) {
    throw new Error('内容包版本或目录不完整');
  }
  const slugs = new Set<string>();
  for (const article of data.articles) {
    if (!article || typeof article.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(article.slug)
      || slugs.has(article.slug) || typeof article.title !== 'string' || typeof article.html !== 'string'
      || !['courses', 'campus', 'tech', 'community'].includes(article.category)
      || typeof article.section !== 'string' || !Array.isArray(article.tags) || !article.tags.every(t => typeof t === 'string')
      || !Array.isArray(article.toc) || article.toc.some(t => !t || typeof t.id !== 'string' || typeof t.text !== 'string' || !Number.isInteger(t.level))
      || /<script\b|<[a-z][^>]*\son\w+\s*=|(?:href|src)\s*=\s*["']\s*javascript:/i.test(article.html)) {
      throw new Error('内容包包含无效或重复文章');
    }
    slugs.add(article.slug);
  }
  for (const category of Object.values(data.categories)) {
    if (!category || typeof category.name !== 'string' || !Array.isArray(category.articles) || !Array.isArray(category.sections)
      || category.articles.some(a => !slugs.has(a.slug))
      || category.sections.some(s => !s || typeof s.name !== 'string' || !Array.isArray(s.articles) || s.articles.some(a => !slugs.has(a.slug)))) {
      throw new Error('内容分类不完整');
    }
  }
  for (const volumes of Object.values(data.courseVolumes)) {
    if (!Array.isArray(volumes) || volumes.some(v => !v || typeof v.key !== 'string' || typeof v.title !== 'string'
      || !Array.isArray(v.slugs) || v.slugs.some(s => !slugs.has(s)))) throw new Error('课程目录不完整');
  }
  if (data.featured.some(a => !slugs.has(a.slug))) throw new Error('精选目录不完整');
}
