import React from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { GraduationCap, School, Code2, Users, ChevronRight, Sparkles } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, fontSize } from "../theme";
import { getFeatured, getCategories, getArticleCount, type ArticleMeta } from "../lib/content";
import { ScreenHeader, SectionTitle } from "../components/ui";
import { ArticleCard } from "../components/ArticleCard";
import { SearchBar } from "../components/SearchBar";

type IconComp = typeof GraduationCap;
const categoryIcon: Record<string, IconComp> = { courses: GraduationCap, campus: School, tech: Code2, community: Users };
const accentKey: Record<string, "accentCourses" | "accentCampus" | "accentTech" | "accentCommunity"> = { courses: "accentCourses", campus: "accentCampus", tech: "accentTech", community: "accentCommunity" };

export default function HomeScreen() {
  const { palette } = useTheme();
  const navigation = useNavigation<any>();
  const total = getArticleCount();
  const categories = getCategories();
  const featured = getFeatured();
  const recommended: ArticleMeta[] = featured.length ? featured : categories.flatMap((c) => c.articles).slice(0, 4);
  const openArticle = (slug: string) => navigation.navigate("Article", { slug });

  return <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
    <ScreenHeader title="嘟嘟 DUDU" subtitle="HDU 知识库 · 离线阅读" />
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { backgroundColor: palette.heroStart }]}>
        <View style={[styles.heroGlow, { backgroundColor: palette.heroEnd }]} />
        <View style={styles.heroCopy}>
          <View style={styles.eyebrow}><Sparkles size={14} color="#B9D1FF" /><Text style={styles.eyebrowText}>今天也来发现一点新知识</Text></View>
          <Text style={styles.heroTitle}>把校园知识，装进口袋。</Text>
          <Text style={styles.heroSub}>{total} 篇文章 · 完全离线 · 随时打开阅读</Text>
        </View>
        <TouchableOpacity activeOpacity={0.88} onPress={() => navigation.navigate("Search")}>
          <SearchBar value="" onChange={() => {}} placeholder="搜索课程、校园生活或技术文章" />
        </TouchableOpacity>
      </View>

      <View>
        <SectionTitle title="精选推荐" action={<Text style={[styles.more, { color: palette.primary }]}>为你挑选</Text>} />
        {recommended.slice(0, 1).map((article) => <ArticleCard key={article.slug} article={article} onPress={() => openArticle(article.slug)} accent={palette.primary} featured />)}
        <View style={styles.feed}>{recommended.slice(1, 4).map((article) => <ArticleCard key={article.slug} article={article} onPress={() => openArticle(article.slug)} accent={palette.primary} />)}</View>
      </View>

      <View>
        <SectionTitle title="探索分类" action={<Text style={[styles.more, { color: palette.primary }]}>全部</Text>} />
        <View style={styles.categoryList}>
          {categories.map((cat) => {
            const Icon = categoryIcon[cat.slug] ?? GraduationCap;
            const accent = palette[accentKey[cat.slug] ?? "accentCourses"];
            return <TouchableOpacity key={cat.slug} activeOpacity={0.75} onPress={() => navigation.navigate("Browse", { category: cat.slug })} style={[styles.categoryRow, { borderBottomColor: palette.divider }]}>
              <View style={[styles.categoryIcon, { backgroundColor: `${accent}18` }]}><Icon size={21} color={accent} /></View>
              <View style={styles.categoryCopy}><Text style={[styles.categoryName, { color: palette.foreground }]}>{cat.name}</Text><Text style={[styles.categoryDesc, { color: palette.foregroundMuted }]}>{cat.desc}</Text></View>
              <Text style={[styles.categoryCount, { color: accent }]}>{cat.articles.length}</Text><ChevronRight size={17} color={palette.foregroundSubtle} />
            </TouchableOpacity>;
          })}
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.xxl, paddingBottom: spacing.xxl },
  hero: { minHeight: 250, borderRadius: radius.xl, padding: spacing.xl, justifyContent: "space-between", overflow: "hidden", gap: spacing.xl },
  heroGlow: { position: "absolute", width: 260, height: 260, borderRadius: 130, opacity: 0.5, top: -110, right: -80 },
  heroCopy: { gap: spacing.sm },
  eyebrow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  eyebrowText: { color: "#B9D1FF", fontSize: fontSize.xs, fontWeight: "700" },
  heroTitle: { color: "#FFFFFF", fontSize: 27, lineHeight: 35, fontWeight: "800", letterSpacing: -0.4 },
  heroSub: { color: "rgba(255,255,255,.72)", fontSize: fontSize.sm },
  more: { fontSize: fontSize.xs, fontWeight: "700" },
  feed: { gap: spacing.md, marginTop: spacing.md },
  categoryList: { borderTopWidth: StyleSheet.hairlineWidth },
  categoryRow: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: spacing.sm },
  categoryIcon: { width: 42, height: 42, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  categoryCopy: { flex: 1, gap: 2 },
  categoryName: { fontSize: fontSize.md, fontWeight: "700" },
  categoryDesc: { fontSize: fontSize.xs },
  categoryCount: { fontSize: fontSize.sm, fontWeight: "800" },
});
