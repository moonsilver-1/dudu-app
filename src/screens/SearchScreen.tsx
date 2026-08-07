import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Clock } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { spacing, fontSize } from "../theme";
import { search, getArticle, type SearchHit, type Article } from "../lib/content";
import { getProgress } from "../lib/storage";
import { ScreenHeader, Pill, EmptyState } from "../components/ui";
import { ArticleCard } from "../components/ArticleCard";
import { SearchBar } from "../components/SearchBar";
import type { ArticleMeta } from "../lib/content";

const HOT_TAGS = ["选课", "食堂", "深度学习", "算法", "社团", "VSCode", "考研"];

export default function SearchScreen() {
  const { palette } = useTheme();
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<{ article: Article; progress: number }[]>([]);

  const results: SearchHit[] = useMemo(
    () => (query.trim() ? search(query) : []),
    [query]
  );

  useEffect(() => {
    let active = true;
    getProgress().then((progressMap) => {
      const entries = Object.entries(progressMap)
        .filter(([, v]) => v > 0)
        .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
        .slice(0, 5);
      const resolved = entries
        .map(([slug, p]) => {
          const article = getArticle(slug);
          return article ? { article, progress: p } : null;
        })
        .filter((x): x is { article: Article; progress: number } => x !== null);
      if (active) setRecent(resolved);
    });
    return () => {
      active = false;
    };
  }, []);

  const openArticle = (slug: string) => navigation.navigate("Article", { slug });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ScreenHeader title="搜索" subtitle="在 131 篇文章中查找" />
      <View style={styles.searchWrap}>
        <SearchBar value={query} onChange={setQuery} />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {query.trim() ? (
          results.length > 0 ? (
            <>
              <Text style={[styles.count, { color: palette.foregroundMuted }]}>找到 {results.length} 条结果</Text>
              {results.map((hit) => (
                <View key={hit.article.slug} style={styles.item}>
                  <ArticleCard article={hit.article} onPress={() => openArticle(hit.article.slug)} />
                </View>
              ))}
            </>
          ) : (
            <EmptyState title="没有找到相关文章" desc="换个关键词试试" />
          )
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: palette.foregroundMuted }]}>热门标签</Text>
            <View style={styles.tags}>
              {HOT_TAGS.map((t) => (
                <Pill key={t} label={t} onPress={() => setQuery(t)} />
              ))}
            </View>
            {recent.length > 0 ? (
              <>
                <View style={styles.recentHead}>
                  <Clock size={16} color={palette.foregroundSubtle} />
                  <Text style={[styles.sectionTitle, { color: palette.foregroundMuted, marginLeft: spacing.xs }]}>最近阅读</Text>
                </View>
                {recent.map(({ article, progress }) => (
                  <View key={article.slug} style={styles.item}>
                    <ArticleCard article={article} onPress={() => openArticle(article.slug)} progress={progress} />
                  </View>
                ))}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  content: { padding: spacing.lg, gap: spacing.md, paddingTop: 0 },
  count: { fontSize: fontSize.sm, fontWeight: "600" },
  sectionTitle: { fontSize: fontSize.md, fontWeight: "700" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  recentHead: { flexDirection: "row", alignItems: "center", marginTop: spacing.lg },
  item: { marginBottom: spacing.md },
});
