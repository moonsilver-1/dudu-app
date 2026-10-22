import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { categoryMeta } from '../theme';
import type { ArticleMeta } from '../lib/content';

export function ArticleCard({ article, onPress, accent, progress, featured = false }: { article: ArticleMeta; onPress: () => void; accent?: string; progress?: number; featured?: boolean }) {
  const { palette } = useTheme();
  const ink = accent ?? palette.primary;
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={article.title} activeOpacity={0.82} onPress={onPress}>
      <View style={[styles.card, featured && styles.featured, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <Text style={[styles.category, { color: ink }]}>{categoryMeta[article.category]?.name ?? article.category}</Text>
        <Text style={[featured ? styles.featuredTitle : styles.title, { color: palette.foreground }]} numberOfLines={featured ? 3 : 2}>{article.title}</Text>
        {article.excerpt ? <Text style={[styles.excerpt, { color: palette.foregroundMuted }]} numberOfLines={featured ? 3 : 2}>{article.excerpt}</Text> : null}
        <View style={styles.meta}>
          {article.author ? <Text numberOfLines={1} style={[styles.author, styles.metaText, { color: palette.foregroundSubtle }]}>{article.author}</Text> : null}
          {article.readingTime ? <Text style={[styles.metaText, { color: palette.foregroundSubtle }]}>{article.readingTime} 分钟</Text> : null}
        </View>
        {typeof progress === 'number' && progress > 0 ? (
          <View style={[styles.progressTrack, { backgroundColor: palette.surfaceMuted }]}>
            <View style={[styles.progressBar, { width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%`, backgroundColor: ink }]} />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, padding: 18, gap: 8 },
  featured: { padding: 22, minHeight: 180 },
  category: { fontSize: 11, lineHeight: 16 },
  title: { fontSize: 17, fontWeight: '700', lineHeight: 26 },
  featuredTitle: { fontSize: 22, fontWeight: '700', lineHeight: 31 },
  excerpt: { fontSize: 13, lineHeight: 21 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 4 },
  author: { flex: 1 },
  metaText: { fontSize: 11, lineHeight: 16 },
  progressTrack: { height: 3, borderRadius: 2, marginTop: 4, overflow: 'hidden' },
  progressBar: { height: 3, borderRadius: 2 },
});
