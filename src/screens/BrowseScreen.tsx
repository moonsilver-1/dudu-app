import { useContent } from "../context/ContentContext";
import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronRight, ChevronDown, BookOpen, Layers } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, fontSize, fontFamily } from "../theme";
import {
  getCategories,
  getCategory,
  getCourseVolumes,
  getArticle,
  type ArticleMeta,
} from "../lib/content";
import { Card, ScreenHeader } from "../components/ui";
import { ArticleCard } from "../components/ArticleCard";

const accentFor: Record<string, string> = {
  courses: "accentCourses",
  campus: "accentCampus",
  tech: "accentTech",
  community: "accentCommunity",
};

export default function BrowseScreen() {
  const { version: contentVersion } = useContent();
  const { palette } = useTheme();
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const selected: string | undefined = route.params?.category;

  const [activeVolume, setActiveVolume] = useState<string | null>(null);

  useEffect(() => {
    setActiveVolume(null);
  }, [selected]);

  const openArticle = (slug: string) => navigation.navigate("Article", { slug });

  if (!selected) {
    const categories = getCategories();
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
        <ScreenHeader title="分类浏览" subtitle="选择一个分类开始阅读" />
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          {categories.map((cat) => {
            const accent = (palette as any)[accentFor[cat.slug]];
            return (
              <TouchableOpacity
                key={cat.slug}
                activeOpacity={0.9}
                onPress={() => navigation.navigate("Browse", { category: cat.slug })}
                style={[styles.catRow, { backgroundColor: palette.surface, borderColor: palette.border }]}
              >
                <View style={[styles.catRowIcon, { backgroundColor: accent + "1A" }]}>
                  <BookOpen size={22} color={accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.catRowName, { color: palette.foreground }]}>{cat.name}</Text>
                  <Text style={[styles.catRowDesc, { color: palette.foregroundMuted }]}>{cat.desc}</Text>
                </View>
                <View style={styles.catRowFoot}>
                  <Text style={[styles.catRowCount, { color: accent }]}>{cat.articles.length} 篇</Text>
                  <ChevronRight size={18} color={palette.foregroundSubtle} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const category = getCategory(selected);
  if (!category) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
        <ScreenHeader title="分类" />
        <View style={{ padding: spacing.xl }}><Text style={{ color: palette.foregroundMuted }}>未找到该分类</Text></View>
      </SafeAreaView>
    );
  }

  const accent = (palette as any)[accentFor[selected]];
  const volumes = getCourseVolumes(selected);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ScreenHeader
        title={category.name}
        subtitle={category.desc}
        right={
          <TouchableOpacity onPress={() => navigation.navigate("Browse", { category: undefined })}>
            <Text style={{ color: palette.primary, fontWeight: "600" }}>全部</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {volumes.length > 0 ? (
          <View>
            <Text style={[styles.blockTitle, { color: palette.foreground }]}>
              <Layers size={16} color={accent} /> 分卷
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.xs }}>
              {volumes.map((v) => (
                <TouchableOpacity
                  key={v.key}
                  activeOpacity={0.9}
                  onPress={() => setActiveVolume(activeVolume === v.key ? null : v.key)}
                  style={[
                    styles.volChip,
                    { backgroundColor: activeVolume === v.key ? accent : palette.surfaceMuted, borderColor: palette.border },
                  ]}
                >
                  <Text style={{ color: activeVolume === v.key ? "#fff" : palette.foreground, fontWeight: "600", fontSize: fontSize.sm }}>
                    {v.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {activeVolume
              ? (() => {
                  const vol = volumes.find((x) => x.key === activeVolume);
                  const arts: ArticleMeta[] = (vol?.slugs ?? [])
                    .map((s) => getArticle(s))
                    .filter(Boolean) as ArticleMeta[];
                  return (
                    <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
                      {arts.map((a) => (
                        <ArticleCard key={a.slug} article={a} onPress={() => openArticle(a.slug)} accent={accent} />
                      ))}
                    </View>
                  );
                })()
              : null}
          </View>
        ) : null}

        {category.sections.map((sec) => (
          <CollapsibleSection
            key={sec.slug}
            title={sec.name}
            count={sec.articles.length}
            accent={accent}
            defaultOpen={false}
            articles={sec.articles}
            onOpen={(slug) => openArticle(slug)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/** 可折叠的子分类区（算法/深度学习这种文章多的 section 默认收起） */
function CollapsibleSection({
  title,
  count,
  accent,
  defaultOpen,
  articles,
  onOpen,
}: {
  title: string;
  count: number;
  accent: string;
  defaultOpen: boolean;
  articles: ArticleMeta[];
  onOpen: (slug: string) => void;
}) {
  const { palette } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen((v) => !v)}
        style={[styles.sectionHeader, { borderColor: palette.border }]}
      >
        <ChevronDown
          size={18}
          color={palette.foregroundMuted}
          style={{ transform: [{ rotate: open ? "0deg" : "-90deg" }] } as any}
        />
        <Text style={[styles.sectionTitleText, { color: palette.foreground }]}>{title}</Text>
        <Text style={[styles.sectionCount, { color: accent }]}>{count} 篇</Text>
      </TouchableOpacity>
      {open ? (
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} onPress={() => onOpen(a.slug)} accent={accent} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  catRowIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  catRowName: { fontSize: fontSize.lg, fontWeight: "700" },
  catRowDesc: { fontSize: fontSize.sm, marginTop: 2 },
  catRowFoot: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  catRowCount: { fontSize: fontSize.sm, fontWeight: "700" },
  blockTitle: { fontSize: fontSize.lg, fontWeight: "700", flexDirection: "row", alignItems: "center", gap: spacing.xs },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionTitleText: { flex: 1, fontSize: fontSize.lg, fontWeight: "700" },
  sectionCount: { fontSize: fontSize.sm, fontWeight: "700" },
  volChip: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
