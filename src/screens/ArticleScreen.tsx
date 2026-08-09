import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Sun,
  Moon,
  Type,
  type LucideIcon,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import * as WebBrowser from "expo-web-browser";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, fontSize, fontFamily } from "../theme";
import {
  getArticle,
  getAdjacent,
  type Article,
  type ArticleMeta,
  type TocItem,
} from "../lib/content";
import { isFavorite, toggleFavorite, setProgress, getProgress } from "../lib/storage";
import { ArticleDocument } from "../components/ArticleDocument";
import { ReadingSettingsPanel } from "../components/ReadingSettingsPanel";
import { ShareCard } from "../components/ShareCard";
import { Pill, EmptyState } from "../components/ui";

export function ArticleScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const slug: string = route.params?.slug ?? "";

  const { palette, mode, toggle } = useTheme();

  const article: Article | undefined = getArticle(slug);
  const adjacent = getAdjacent(slug);

  const [isFav, setIsFav] = useState(false);
  const [progressRatio, setProgressRatio] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [readingPanelOpen, setReadingPanelOpen] = useState(false);
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const [activeToc, setActiveToc] = useState<string | null>(null);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRatio = useRef(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const fav = await isFavorite(slug);
      const all = await getProgress();
      if (!mounted) return;
      setIsFav(fav);
      const saved = all[slug] ?? 0;
      maxRatio.current = saved;
      setProgressRatio(saved);
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  const handleScrollRatio = (ratio: number) => {
    const clamped = Math.max(0, Math.min(1, ratio));
    setProgressRatio(clamped);
    if (clamped > maxRatio.current) maxRatio.current = clamped;
    if (saveTimer.current) return;
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      void setProgress(slug, maxRatio.current);
    }, 800);
  };

  const handleFavorite = async () => {
    const next = await toggleFavorite(slug);
    setIsFav(next);
  };

  const handleShare = () => {
    Alert.alert("分享文章", "选择分享方式", [
      {
        text: "生成分享图片 📸",
        onPress: () => setShareCardOpen(true),
      },
      {
        text: "复制链接 🔗",
        onPress: async () => {
          const link = "https://hdu-wiki.cn/article/" + slug;
          await Clipboard.setStringAsync(link);
          Alert.alert("已复制", "文章链接已复制到剪贴板");
        },
      },
      { text: "取消", style: "cancel" },
    ]);
  };

  const handleLinkPress = (url: string) => {
    if (url.startsWith("http")) void WebBrowser.openBrowserAsync(url);
  };

  const navigateTo = (nextSlug: string) => {
    setDrawerOpen(false);
    setActiveToc(null);
    navigation.navigate("Article", { slug: nextSlug });
  };

  const handleTocPress = (item: TocItem) => {
    // TODO: 完整锚点滚动需要 WebView bridge（注入 scrollIntoView），当前超出范围；这里仅高亮并关闭抽屉。
    setActiveToc(item.id);
    setDrawerOpen(false);
  };

  const iconBtn = (
    Icon: LucideIcon,
    color: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity onPress={onPress} hitSlop={10} style={styles.iconBtn}>
      <Icon size={22} color={color} />
    </TouchableOpacity>
  );

  if (!article) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
        <EmptyState title="文章不存在" desc="该文章可能已被移除" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      {/* 顶部进度条 */}
      <View style={[styles.progressTrack, { backgroundColor: palette.surfaceMuted }]}>
        <View style={[styles.progressBar, { width: `${Math.round(progressRatio * 100)}%`, backgroundColor: palette.primary }]} />
      </View>

      {/* 顶部栏 */}
      <View style={[styles.topBar, { borderColor: palette.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={24} color={palette.foreground} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: palette.foreground }]} numberOfLines={1}>{article.title}</Text>
        <View style={styles.topActions}>
          {iconBtn(isFav ? BookmarkCheck : Bookmark, isFav ? palette.primary : palette.foregroundMuted, handleFavorite)}
          {iconBtn(List, palette.foregroundMuted, () => setDrawerOpen(true))}
          {iconBtn(Type, palette.foregroundMuted, () => setReadingPanelOpen(true))}
          {iconBtn(Share2, palette.foregroundMuted, handleShare)}
          {iconBtn(mode === "dark" ? Sun : Moon, palette.foregroundMuted, toggle)}
        </View>
      </View>

      {/* 正文：标题/作者/标签 全部注入 WebView 内渲染，WebView 自己滚动，占满剩余空间 */}
      <ArticleDocument
        html={article.html}
        title={article.title}
        author={article.author}
        readingTime={article.readingTime}
        tags={article.tags}
        onScrollRatio={handleScrollRatio}
        onLinkPress={handleLinkPress}
      />

      {/* 底部上下篇 */}
      <View style={[styles.bottomBar, { borderColor: palette.border, backgroundColor: palette.surface }]}>
        <TouchableOpacity
          disabled={!adjacent.prev}
          onPress={() => adjacent.prev && navigateTo(adjacent.prev.slug)}
          style={[styles.navBtn, !adjacent.prev && styles.navDisabled]}
        >
          <ChevronLeft size={18} color={adjacent.prev ? palette.primary : palette.foregroundSubtle} />
          <Text style={{ color: adjacent.prev ? palette.primary : palette.foregroundSubtle, fontSize: fontSize.sm }}>上一篇</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!adjacent.next}
          onPress={() => adjacent.next && navigateTo(adjacent.next.slug)}
          style={[styles.navBtn, !adjacent.next && styles.navDisabled]}
        >
          <Text style={{ color: adjacent.next ? palette.primary : palette.foregroundSubtle, fontSize: fontSize.sm }}>下一篇</Text>
          <ChevronRight size={18} color={adjacent.next ? palette.primary : palette.foregroundSubtle} />
        </TouchableOpacity>
      </View>

      {/* TOC 抽屉 */}
      {drawerOpen ? (
        <View style={styles.drawerRoot}>
          <TouchableOpacity style={[styles.drawerMask, { backgroundColor: palette.overlay }]} activeOpacity={1} onPress={() => setDrawerOpen(false)} />
          <View style={[styles.drawer, { backgroundColor: palette.surface }]}>
            <Text style={[styles.drawerTitle, { color: palette.foreground }]}>目录</Text>
            <ScrollView>
              {article.toc.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => handleTocPress(item)}>
                  <Text
                    style={[
                      styles.tocItem,
                      { color: activeToc === item.id ? palette.primary : palette.foregroundMuted, paddingLeft: spacing.md + (item.level - 1) * 14 },
                    ]}
                    numberOfLines={1}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
              ))}
              {article.toc.length === 0 ? <Text style={{ color: palette.foregroundSubtle, padding: spacing.md }}>本文暂无小标题</Text> : null}
            </ScrollView>
          </View>
        </View>
      ) : null}

      {/* 阅读设置面板（字号/行距/护眼） */}
      <ReadingSettingsPanel visible={readingPanelOpen} onClose={() => setReadingPanelOpen(false)} />

      {/* 分享卡片（生成图片+二维码） */}
      <ShareCard
        visible={shareCardOpen}
        article={article}
        onClose={() => setShareCardOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressTrack: { height: 3 },
  progressBar: { height: 3 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topTitle: { flex: 1, fontSize: fontSize.md, fontWeight: "700" },
  topActions: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  iconBtn: { padding: 4, alignItems: "center", justifyContent: "center" },
  title: { fontSize: fontSize.xxl, fontWeight: "800", lineHeight: 30 },
  metaRow: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.xs },
  metaText: { fontSize: fontSize.sm },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm },
  bottomBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: spacing.md,
  },
  navDisabled: { opacity: 0.5 },
  drawerRoot: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 },
  drawerMask: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "82%",
    padding: spacing.lg,
    paddingTop: spacing.xl,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  drawerTitle: { fontSize: fontSize.lg, fontWeight: "800", marginBottom: spacing.md },
  tocItem: { fontSize: fontSize.md, paddingVertical: spacing.sm },
});
