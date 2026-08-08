import React from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  GraduationCap,
  School,
  Code2,
  Users,
  ChevronRight,
  type LucideIcon,
} from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, fontSize } from "../theme";
import { getFeatured, getCategories, getArticleCount, type ArticleMeta } from "../lib/content";
import { Card, ScreenHeader, Pill } from "../components/ui";
import { ArticleCard } from "../components/ArticleCard";
import { SearchBar } from "../components/SearchBar";

type AccentKey = "accentCourses" | "accentCampus" | "accentTech" | "accentCommunity";
type IconComp = LucideIcon;

const categoryIcon: Record<string, IconComp> = {
  courses: GraduationCap,
  campus: School,
  tech: Code2,
  community: Users,
};

function accentKeyFor(slug: string): AccentKey {
  switch (slug) {
    case "courses": return "accentCourses";
    case "campus": return "accentCampus";
    case "tech": return "accentTech";
    case "community": return "accentCommunity";
    default: return "accentCourses";
  }
}

export default function HomeScreen() {
  const { palette } = useTheme();
  const navigation: any = useNavigation();

  const total = getArticleCount();
  const categories = getCategories();
  const featured = getFeatured();
  const fallback = categories.flatMap((c) => c.articles).slice(0, 4);
  const recommended: ArticleMeta[] = featured.length > 0 ? featured : fallback;

  const openArticle = (slug: string) => navigation.navigate("Article", { slug });
  const openSearch = () => navigation.navigate("Search");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ScreenHeader title="嘟嘟 DUDU" subtitle="HDU 知识库 · 离线阅读" />
      <ScrollView
        style={{ flex: 1, backgroundColor: palette.background }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* 欢迎区：去掉刺眼的彩色大框，改成干净简洁的标题 + 搜索框 */}
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { color: palette.foreground }]}>欢迎来到嘟嘟 🐑</Text>
          <Text style={[styles.heroSub, { color: palette.foregroundMuted }]}>
            共收录 {total} 篇 HDU 知识库文章，随时离线阅读。
          </Text>
          <TouchableOpacity activeOpacity={0.9} onPress={openSearch}>
            <SearchBar value="" onChange={() => {}} placeholder={`搜索 ${total} 篇文章…`} />
          </TouchableOpacity>
        </View>

        <View>
          <Text style={[styles.sectionTitle, { color: palette.foreground }]}>精选推荐</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.md, paddingVertical: spacing.xs }}
          >
            {recommended.map((article) => (
              <View key={article.slug} style={styles.featureCard}>
                <ArticleCard article={article} onPress={() => openArticle(article.slug)} accent={palette.primary} />
              </View>
            ))}
          </ScrollView>
        </View>

        <View>
          <Text style={[styles.sectionTitle, { color: palette.foreground }]}>分类</Text>
          <View style={styles.catGrid}>
            {categories.map((cat) => {
              const Icon = categoryIcon[cat.slug] ?? GraduationCap;
              const accent = palette[accentKeyFor(cat.slug)];
              return (
                <TouchableOpacity
                  key={cat.slug}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate("Browse", { category: cat.slug })}
                  style={[styles.catCard, { backgroundColor: palette.surface, borderColor: palette.border }]}
                >
                  <View style={[styles.catIcon, { backgroundColor: accent + "1A" }]}>
                    <Icon size={22} color={accent} />
                  </View>
                  <Text style={[styles.catName, { color: palette.foreground }]} numberOfLines={1}>{cat.name}</Text>
                  <Text style={[styles.catDesc, { color: palette.foregroundMuted }]} numberOfLines={1}>{cat.desc}</Text>
                  <View style={styles.catFoot}>
                    <Text style={[styles.catCount, { color: accent }]}>{cat.articles.length} 篇</Text>
                    <ChevronRight size={16} color={palette.foregroundSubtle} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.sm, marginBottom: spacing.xs },
  heroTitle: { fontSize: fontSize.xxl, fontWeight: "800", letterSpacing: 0.2 },
  heroSub: { fontSize: fontSize.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: "700", marginBottom: spacing.xs },
  featureCard: { width: 280 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  catCard: {
    width: "47%",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  catIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: spacing.xs },
  catName: { fontSize: fontSize.md, fontWeight: "700" },
  catDesc: { fontSize: fontSize.xs },
  catFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.xs },
  catCount: { fontSize: fontSize.sm, fontWeight: "700" },
});
