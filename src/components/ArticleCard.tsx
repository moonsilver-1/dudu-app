import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Clock, User, ArrowUpRight } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, fontSize } from "../theme";
import type { ArticleMeta } from "../lib/content";
import { Pill } from "./ui";

export function ArticleCard({ article, onPress, accent, progress, featured = false }: { article: ArticleMeta; onPress: () => void; accent?: string; progress?: number; featured?: boolean }) {
  const { palette } = useTheme();
  const barColor = accent ?? palette.primary;
  return <TouchableOpacity activeOpacity={0.82} onPress={onPress}>
    <View style={[styles.card, featured && styles.featured, { backgroundColor: palette.surface, borderColor: palette.divider }]}>
      <View style={styles.heading}>
        <Text style={[featured ? styles.featuredTitle : styles.title, { color: palette.foreground }]} numberOfLines={featured ? 3 : 2}>{article.title}</Text>
        {featured ? <ArrowUpRight size={20} color={barColor} /> : null}
      </View>
      {article.excerpt ? <Text style={[styles.excerpt, { color: palette.foregroundMuted }]} numberOfLines={featured ? 3 : 2}>{article.excerpt}</Text> : null}
      <View style={styles.meta}>
        {article.author ? <View style={styles.metaItem}><User size={12} color={palette.foregroundSubtle} /><Text style={[styles.metaText, { color: palette.foregroundSubtle }]}>{article.author}</Text></View> : null}
        {article.readingTime ? <View style={styles.metaItem}><Clock size={12} color={palette.foregroundSubtle} /><Text style={[styles.metaText, { color: palette.foregroundSubtle }]}>{article.readingTime} 分钟阅读</Text></View> : null}
      </View>
      {article.tags.length > 0 && !featured ? <View style={styles.tags}>{article.tags.slice(0, 2).map((t) => <Pill key={t} label={t} />)}</View> : null}
      {typeof progress === "number" && progress > 0 ? <View style={[styles.progressTrack, { backgroundColor: palette.surfaceMuted }]}><View style={[styles.progressBar, { width: `${Math.round(progress * 100)}%`, backgroundColor: barColor }]} /></View> : null}
    </View>
  </TouchableOpacity>;
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg, gap: spacing.sm },
  featured: { padding: spacing.xl, minHeight: 190 },
  heading: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  title: { flex: 1, fontSize: fontSize.lg, fontWeight: "700", lineHeight: 23 },
  featuredTitle: { flex: 1, fontSize: 22, fontWeight: "800", lineHeight: 29, letterSpacing: -0.25 },
  excerpt: { fontSize: fontSize.sm, lineHeight: 20 },
  meta: { flexDirection: "row", gap: spacing.lg, marginTop: 2 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: fontSize.xs },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: 2 },
  progressTrack: { height: 3, borderRadius: radius.full, marginTop: spacing.xs, overflow: "hidden" },
  progressBar: { height: 3, borderRadius: radius.full },
});
