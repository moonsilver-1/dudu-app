/**
 * DUDU（嘟嘟）设计系统 — 全局设计令牌。
 * 所有屏幕/组件都必须从这里取色与间距，保证视觉一致。
 * 智能体协作约定：不要自行硬编码颜色，统一用本文件的 token。
 */
import { Platform } from "react-native";

export type ThemeMode = "light" | "dark";

export interface Palette {
  // 背景层级
  background: string;
  surface: string;
  surfaceMuted: string;
  // 前景文字
  foreground: string;
  foregroundMuted: string;
  foregroundSubtle: string;
  // 边框
  border: string;
  // 羊主题：纸白、草绿与暖棕
  primary: string;
  primaryStrong: string;
  primarySoft: string; // 主色低透明度背景
  onPrimary: string;
  // 语义色
  success: string;
  warning: string;
  danger: string;
  // 分类主题色
  accentCourses: string;
  accentCampus: string;
  accentTech: string;
  accentCommunity: string;
  // 叠加层
  overlay: string;
  skeleton: string;
  // WebView 内容区背景
  contentBg: string;
  // 内容流与品牌层
  divider: string;
  heroStart: string;
  heroEnd: string;
  onHero: string;
}

export const lightPalette: Palette = {
  background: "#F7F4EA",
  surface: "#FFFDF7",
  surfaceMuted: "#EEE9DC",
  foreground: "#342E26",
  foregroundMuted: "#6D685B",
  foregroundSubtle: "#7B7468",
  border: "#DEDACB",
  primary: "#496446",
  primaryStrong: "#354F33",
  primarySoft: "#E7EBDC",
  onPrimary: "#FFFFFF",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  accentCourses: "#596F47",
  accentCampus: "#8C6546",
  accentTech: "#547568",
  accentCommunity: "#887032",
  overlay: "rgba(40,35,26,0.45)",
  skeleton: "#E5E0D4",
  contentBg: "#FFFDF7",
  divider: "#E5DFD1",
  heroStart: "#344834",
  heroEnd: "#68815B",
  onHero: "#FFFFFF",
};

export const darkPalette: Palette = {
  background: "#1C211A",
  surface: "#272C23",
  surfaceMuted: "#33382D",
  foreground: "#F3EFDF",
  foregroundMuted: "#C1BDAE",
  foregroundSubtle: "#ABA796",
  border: "#42483B",
  primary: "#B8CC9C",
  primaryStrong: "#D0E1BA",
  primarySoft: "#333F2A",
  onPrimary: "#20291B",
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  accentCourses: "#B8CC9C",
  accentCampus: "#D4B392",
  accentTech: "#A6C6B6",
  accentCommunity: "#D3C186",
  overlay: "rgba(0,0,0,0.55)",
  skeleton: "#33382D",
  contentBg: "#20251D",
  divider: "#42483B",
  heroStart: "#20291B",
  heroEnd: "#405433",
  onHero: "#FFFFFF",
};

export const paletteFor = (mode: ThemeMode): Palette =>
  mode === "dark" ? darkPalette : lightPalette;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const fontSize = {
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  title: 32,
};

export const fontFamily = {
  // 系统字体栈，跨平台稳妥；中文回退到系统默认
  sans: Platform.select({
    ios: "System",
    android: "sans-serif",
    default: "sans-serif",
  }),
  mono: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }),
};

export const shadow = (mode: ThemeMode) =>
  mode === "dark"
    ? {
        shadowColor: "#000000",
        shadowOpacity: 0.5,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
      }
    : {
        shadowColor: "#1A2440",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
      };

// 分类中文名 → 主题色 key
export const categoryAccent: Record<string, keyof Palette> = {
  courses: "accentCourses",
  campus: "accentCampus",
  tech: "accentTech",
  community: "accentCommunity",
};

export const categoryMeta: Record<
  string,
  { name: string; icon: string; desc: string }
> = {
  courses: { name: "课程与学术", icon: "GraduationCap", desc: "课程笔记 · 学术方法" },
  campus: { name: "校园生活", icon: "School", desc: "吃喝玩乐 · 校园攻略" },
  tech: { name: "技术与项目", icon: "Code2", desc: "工程实践 · 工具技巧" },
  community: { name: "社团与活动", icon: "Users", desc: "社团 · 竞赛征文" },
};
