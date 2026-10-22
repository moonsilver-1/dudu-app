import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GraduationCap, School, Code2, Users, ArrowUpRight, BookOpen, Search, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useContent } from '../context/ContentContext';
import { getFeatured, getCategories, getArticleCount, getAllArticles } from '../lib/content';
import { SectionTitle } from '../components/ui';
import { ArticleCard } from '../components/ArticleCard';
import { categoryAccent } from '../theme';

const icons: Record<string, typeof BookOpen> = { courses: GraduationCap, campus: School, tech: Code2, community: Users };
export default function HomeScreen() {
  const { palette } = useTheme();
  const { version, updatedAt, refreshing, message, refresh } = useContent();
  const navigation = useNavigation<any>();
  const categories = getCategories();
  const featured = getFeatured();
  const latest = React.useMemo(() => [...getAllArticles()].sort((a,b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0,5), [version]);
  const open = (slug: string) => navigation.navigate('Article', { slug });
  return <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.background }}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={palette.primary} />}>
      <View style={styles.masthead}>
        <View><Text style={[styles.brand, {color:palette.foreground}]}>嘟嘟<Text style={{color:palette.primary}}> DUDU</Text></Text><Text style={[styles.brandSub,{color:palette.foregroundMuted}]}>属于杭电人的口袋知识库</Text></View>
        <View style={[styles.badge,{backgroundColor:palette.surface,borderColor:palette.border}]}><View style={[styles.dot,{backgroundColor:palette.success}]}/><Text style={{color:palette.foregroundMuted,fontSize:11}}>HDU / 杭电</Text></View>
      </View>
      <View style={[styles.hero,{backgroundColor:palette.heroStart}]}>
        <View style={[styles.orbit,{borderColor:palette.heroEnd}]}/>
        <Text style={styles.eyebrow}>YOUR CAMPUS COMPANION</Text>
        <Text style={styles.heroTitle}>大学生活，{'\n'}慢慢读懂。</Text>
        <Text style={styles.heroDescription}>从第一堂课，到第一次做项目。{'\n'}把前人的经验，变成自己的底气。</Text>
        <View style={styles.heroFoot}><Text style={styles.heroCount}>{getArticleCount()} 篇文章 · 离线也能读</Text><BookOpen size={30} color="#D8CEEF" strokeWidth={1.4}/></View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="搜索文章" onPress={()=>navigation.navigate('Search')}
        style={({pressed})=>[styles.search,{backgroundColor:palette.surface,borderColor:palette.border,opacity:pressed?.7:1}]}>
        <Search size={20} color={palette.primary}/><Text style={{flex:1,color:palette.foregroundMuted,fontSize:14}}>今天想了解什么？</Text><Text style={[styles.key,{color:palette.foregroundSubtle,backgroundColor:palette.surfaceMuted}]}>搜索</Text>
      </Pressable>
      <View>
        <SectionTitle title="从这里出发" action={<Text style={{color:palette.foregroundSubtle,fontSize:12}}>四个方向，无限可能</Text>}/>
        <View style={styles.grid}>{categories.map(cat=>{
          const Icon=icons[cat.slug] ?? BookOpen;
          const accent=palette[categoryAccent[cat.slug] ?? 'primary'];
          return <Pressable key={cat.slug} accessibilityRole="button" accessibilityLabel={`${cat.name}，${cat.articles.length}篇`}
            onPress={()=>navigation.navigate('Browse',{category:cat.slug})}
            style={({pressed})=>[styles.category,{backgroundColor:palette.surface,borderColor:palette.border,opacity:pressed?.7:1}]}>
            <View style={styles.categoryTop}><View style={[styles.icon,{backgroundColor:accent+'15'}]}><Icon size={22} color={accent}/></View><ArrowUpRight size={16} color={palette.foregroundSubtle}/></View>
            <Text style={[styles.categoryName,{color:palette.foreground}]}>{cat.name}</Text><Text style={{color:palette.foregroundMuted,fontSize:12}}>{cat.articles.length} 篇值得收藏的经验</Text>
          </Pressable>;
        })}</View>
      </View>
      <View><SectionTitle title="初来乍到，先读这些"/>
        <View style={styles.feed}>{featured.slice(0,3).map(a=><ArticleCard key={a.slug} article={a} onPress={()=>open(a.slug)}/>)}</View>
      </View>
      <View><SectionTitle title="最近收录" action={<Text style={{color:palette.foregroundSubtle,fontSize:12}}>保持好奇</Text>}/>
        <View style={styles.feed}>{latest.map(a=><ArticleCard key={a.slug} article={a} onPress={()=>open(a.slug)}/>)}</View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="更新文章" disabled={refreshing} onPress={refresh} style={styles.sync}>
        <RefreshCw size={14} color={palette.primary}/><View style={{flex:1}}><Text style={{color:palette.foregroundMuted,fontSize:12}}>{refreshing?'正在同步网站文章…':message}</Text><Text style={{color:palette.foregroundSubtle,fontSize:11,marginTop:3}}>内容包 {new Date(updatedAt).toLocaleDateString('zh-CN')} · 下拉或点此更新</Text></View>
      </Pressable>
      <Text style={[styles.signature,{color:palette.foregroundSubtle}]}>FROM SHEEP TO GOAT · 一起慢慢成长</Text>
    </ScrollView>
  </SafeAreaView>;
}
const styles=StyleSheet.create({
  page:{padding:22,paddingBottom:28,gap:24,maxWidth:720,width:'100%',alignSelf:'center'},
  masthead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},
  brand:{fontSize:24,fontWeight:'800',letterSpacing:-.7},brandSub:{fontSize:11,marginTop:5},
  badge:{borderWidth:1,borderRadius:30,paddingVertical:9,paddingHorizontal:11,flexDirection:'row',alignItems:'center',gap:6},dot:{width:5,height:5,borderRadius:3},
  hero:{borderRadius:26,padding:26,overflow:'hidden'},orbit:{position:'absolute',width:250,height:250,borderRadius:125,borderWidth:40,right:-150,top:-50,opacity:.5},
  eyebrow:{color:'#C9BCDF',fontSize:9,fontWeight:'700',letterSpacing:2},heroTitle:{color:'#FFFDF9',fontSize:33,lineHeight:44,fontWeight:'800',letterSpacing:-1,marginTop:18},
  heroDescription:{color:'#D8CEEA',fontSize:12,lineHeight:22,marginTop:13},heroFoot:{marginTop:26,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},heroCount:{color:'#E9E1F6',fontSize:11},
  search:{minHeight:56,borderRadius:18,borderWidth:1,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:16,marginTop:-8},key:{fontSize:10,paddingHorizontal:8,paddingVertical:5,borderRadius:6},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:12},category:{width:'48%',flexGrow:1,borderWidth:1,borderRadius:20,padding:16,gap:8},categoryTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:5},icon:{width:38,height:38,borderRadius:12,alignItems:'center',justifyContent:'center'},categoryName:{fontSize:16,fontWeight:'700'},
  feed:{gap:12},sync:{flexDirection:'row',alignItems:'center',gap:12,padding:8},signature:{fontSize:9,letterSpacing:1,textAlign:'center'},
});
