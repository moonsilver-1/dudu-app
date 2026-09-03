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
  // 品牌主色（科技蓝紫）
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
  background: "#FAFAF7",
  surface: "#FFFFFF",
  surfaceMuted: "#F2F1EC",
  foreground: "#1A1A1A",
  foregroundMuted: "#555555",
  foregroundSubtle: "#8C8C8C",
  border: "#E8E6E0",
  primary: "#2563EB",
  primaryStrong: "#1D4ED8",
  primarySoft: "rgba(37,99,235,0.08)",
  onPrimary: "#FFFFFF",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  accentCourses: "#4F46E5",
  accentCampus: "#DB2777",
  accentTech: "#0891B2",
  accentCommunity: "#D97706",
  overlay: "rgba(11,18,32,0.45)",
  skeleton: "#E6E9F0",
  contentBg: "#FFFFFF",
  divider: "#EEEDE8",
  heroStart: "#10264D",
  heroEnd: "#2563EB",
  onHero: "#FFFFFF",
};

export const darkPalette: Palette = {
  background: "#0B1220",
  surface: "#131C2E",
  surfaceMuted: "#1B2740",
  foreground: "#EAF0FB",
  foregroundMuted: "#9AA6BE",
  foregroundSubtle: "#6B768E",
  border: "#243149",
  primary: "#818CF8",
  primaryStrong: "#A5B4FC",
  primarySoft: "rgba(129,140,248,0.14)",
  onPrimary: "#0B1220",
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  accentCourses: "#A5B4FC",
  accentCampus: "#F472B6",
  accentTech: "#38BDF8",
  accentCommunity: "#FBBF24",
  overlay: "rgba(0,0,0,0.55)",
  skeleton: "#1B2740",
  contentBg: "#0E1626",
  divider: "#243149",
  heroStart: "#0B1220",
  heroEnd: "#312E81",
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
