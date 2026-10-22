import React from 'react';
import { ScrollView, View, Text, Image, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useContent } from '../context/ContentContext';
import { getFeatured, getCategories, getArticleCount, getAllArticles } from '../lib/content';
import { SectionTitle } from '../components/ui';
import { ArticleCard } from '../components/ArticleCard';

const sheep = require('../../assets/wiki-sheep.png');
const categoryLabels: Record<string, { title: string; description: string }> = {
  courses: { title: '课程笔记', description: '算法、数学、专业课' },
  campus: { title: '校园生活', description: '吃住出行、办事攻略' },
  tech: { title: '技术与项目', description: '编程、工具、项目实践' },
  community: { title: '社团与活动', description: '社团介绍、活动记录' },
};

export default function HomeScreen() {
  const { palette } = useTheme();
  const { version, updatedAt, refreshing, message, refresh } = useContent();
  const navigation = useNavigation<any>();
  const categories = getCategories();
  const featured = getFeatured();
  const latest = React.useMemo(
    () => [...getAllArticles()].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, 5),
    [version],
  );
  const open = (slug: string) => navigation.navigate('Article', { slug });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={palette.primary} />}
      >
        <View style={styles.masthead}>
          <Text style={[styles.brand, { color: palette.foreground }]}>嘟嘟</Text>
          <Text style={[styles.mastheadNote, { color: palette.foregroundMuted }]}>杭电人的共享笔记</Text>
        </View>

        <View style={[styles.cover, { backgroundColor: palette.primarySoft, borderColor: palette.border }]}>
          <View style={styles.coverRow}>
            <View style={styles.coverCopy}>
              <Text style={[styles.coverTitle, { color: palette.foreground }]}>杭电 Wiki</Text>
              <Text style={[styles.coverDescription, { color: palette.foregroundMuted }]}>课程笔记、办事攻略，{'\n'}需要的时候翻一翻。</Text>
            </View>
            <Image source={sheep} style={styles.sheep} resizeMode="contain" accessible={false} />
          </View>
          <View style={[styles.coverFooter, { borderColor: palette.primary + '30' }]}>
            <Text style={[styles.coverCount, { color: palette.primary }]}>{getArticleCount()} 篇文章</Text>
            <Text style={[styles.coverCount, { color: palette.foregroundMuted }]}>离线也能看</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="搜索文章"
          onPress={() => navigation.navigate('Search')}
          style={({ pressed }) => [styles.search, { backgroundColor: palette.surface, borderColor: palette.border, opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[styles.searchPlaceholder, { color: palette.foregroundSubtle }]}>搜文章、课程或关键词</Text>
          <Text style={[styles.searchAction, { color: palette.primary }]}>搜索</Text>
        </Pressable>

        <View style={styles.categories}>
          {categories.map((category) => {
            const label = categoryLabels[category.slug];
            return (
              <Pressable
                key={category.slug}
                accessibilityRole="button"
                accessibilityLabel={`${category.name}，${category.articles.length}篇`}
                onPress={() => navigation.navigate('Browse', { category: category.slug })}
                style={({ pressed }) => [styles.category, { backgroundColor: pressed ? palette.primarySoft : palette.surface, borderColor: palette.border }]}
              >
                <Text style={[styles.categoryName, { color: palette.foreground }]}>{label?.title ?? category.name}</Text>
                <Text style={[styles.categoryDescription, { color: palette.foregroundMuted }]}>{label?.description ?? category.desc}</Text>
                <Text style={[styles.categoryCount, { color: palette.primary }]}>{category.articles.length} 篇</Text>
              </Pressable>
            );
          })}
        </View>

        <View>
          <SectionTitle title="新生先看" />
          <View style={styles.feed}>
            {featured.slice(0, 3).map((article) => <ArticleCard key={article.slug} article={article} onPress={() => open(article.slug)} />)}
          </View>
        </View>
        <View>
          <SectionTitle title="最近更新" />
          <View style={styles.feed}>
            {latest.map((article) => <ArticleCard key={article.slug} article={article} onPress={() => open(article.slug)} />)}
          </View>
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="更新文章" disabled={refreshing} onPress={refresh} style={[styles.sync, { borderColor: palette.border }]}>
          <Text style={[styles.syncMessage, { color: palette.foregroundMuted }]}>{refreshing ? '正在更新文章…' : message}</Text>
          <Text style={[styles.syncDate, { color: palette.foregroundSubtle }]}>{new Date(updatedAt).toLocaleDateString('zh-CN')} · 下拉或点这里更新</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 24, gap: 20, maxWidth: 720, width: '100%', alignSelf: 'center' },
  masthead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  brand: { fontSize: 24, fontWeight: '800', letterSpacing: 1 },
  mastheadNote: { fontSize: 12 },
  cover: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 20, paddingTop: 18 },
  coverRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coverCopy: { flex: 1, minWidth: 0 },
  coverTitle: { fontSize: 27, fontWeight: '800', lineHeight: 35 },
  coverDescription: { fontSize: 12, lineHeight: 21, marginTop: 9 },
  sheep: { width: 112, height: 112, borderRadius: 56 },
  coverFooter: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 16, paddingVertical: 12 },
  coverCount: { fontSize: 11 },
  search: { minHeight: 52, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  searchPlaceholder: { flex: 1, fontSize: 13 },
  searchAction: { fontSize: 13, fontWeight: '700' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  category: { flexBasis: '46%', flexGrow: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, padding: 14 },
  categoryName: { fontSize: 16, fontWeight: '700', lineHeight: 23 },
  categoryDescription: { fontSize: 11, lineHeight: 18, marginTop: 4 },
  categoryCount: { fontSize: 11, marginTop: 10 },
  feed: { gap: 10 },
  sync: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 18, paddingBottom: 6, gap: 5 },
  syncMessage: { fontSize: 12, lineHeight: 19 },
  syncDate: { fontSize: 11 },
});
