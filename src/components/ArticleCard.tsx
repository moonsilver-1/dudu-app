import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Clock, User } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, fontSize } from "../theme";
import type { ArticleMeta } from "../lib/content";
import { Pill } from "./ui";

/** 文章卡片（列表/网格通用） */
export function ArticleCard({
  article,
  onPress,
  accent,
  progress,
}: {
  article: ArticleMeta;
  onPress: () => void;
  accent?: string;
  progress?: number;
}) {
  const { palette } = useTheme();
  const barColor = accent ?? palette.primary;
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={styles.top}>
          <Text style={[styles.title, { color: palette.foreground }]} numberOfLines={2}>
            {article.title}
          </Text>
        </View>
        {article.excerpt ? (
          <Text
            style={[styles.excerpt, { color: palette.foregroundMuted }]}
            numberOfLines={2}
          >
            {article.excerpt}
          </Text>
        ) : null}
        <View style={styles.meta}>
          {article.author ? (
            <View style={styles.metaItem}>
              <User size={13} color={palette.foregroundSubtle} />
              <Text style={[styles.metaText, { color: palette.foregroundSubtle }]}>
                {article.author}
              </Text>
            </View>
          ) : null}
          {article.readingTime ? (
            <View style={styles.metaItem}>
              <Clock size={13} color={palette.foregroundSubtle} />
              <Text style={[styles.metaText, { color: palette.foregroundSubtle }]}>
                {article.readingTime} 分钟
              </Text>
            </View>
          ) : null}
        </View>
        {article.tags.length > 0 ? (
          <View style={styles.tags}>
            {article.tags.slice(0, 3).map((t) => (
              <Pill key={t} label={t} />
            ))}
          </View>
        ) : null}
        {typeof progress === "number" && progress > 0 ? (
          <View style={[styles.progressTrack, { backgroundColor: palette.surfaceMuted }]}>
            <View
              style={[
                styles.progressBar,
                { width: `${Math.round(progress * 100)}%`, backgroundColor: barColor },
              ]}
            />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  top: { flexDirection: "row" },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    flex: 1,
    lineHeight: 22,
  },
  excerpt: { fontSize: fontSize.sm, lineHeight: 20 },
  meta: { flexDirection: "row", gap: spacing.lg, marginTop: 2 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: fontSize.xs },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: 2 },
  progressTrack: {
    height: 4,
    borderRadius: radius.full,
    marginTop: spacing.xs,
    overflow: "hidden",
  },
  progressBar: { height: 4, borderRadius: radius.full },
});
