import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Bookmark } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { spacing, fontSize } from "../theme";
import { getArticle, type Article } from "../lib/content";
import { getFavorites, getProgress } from "../lib/storage";
import { ScreenHeader, EmptyState } from "../components/ui";
import { ArticleCard } from "../components/ArticleCard";

export default function FavoritesScreen() {
  const { palette } = useTheme();
  const navigation = useNavigation<any>();
  const [articles, setArticles] = useState<{ article: Article; progress: number }[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const slugs = await getFavorites();
      const progressMap = await getProgress();
      const resolved = slugs
        .map((slug) => {
          const article = getArticle(slug);
          return article ? { article, progress: progressMap[slug] ?? 0 } : null;
        })
        .filter((x): x is { article: Article; progress: number } => x !== null);
      if (active) setArticles(resolved);
    })();
    return () => {
      active = false;
    };
  }, []);

  const openArticle = (slug: string) => navigation.navigate("Article", { slug });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ScreenHeader title="我的收藏" subtitle="离线随时回看" />
      {articles.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={40} color={palette.foregroundSubtle} />}
          title="还没有收藏"
          desc="在文章页点右上角书签即可收藏"
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {articles.map(({ article, progress }) => (
            <View key={article.slug} style={styles.item}>
              <ArticleCard article={article} onPress={() => openArticle(article.slug)} progress={progress} />
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  item: { marginBottom: spacing.md },
});
