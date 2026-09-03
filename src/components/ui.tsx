import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, fontSize, shadow } from "../theme";

export function Card({ children, style, onPress, elevated = false }: { children: React.ReactNode; style?: ViewStyle | ViewStyle[]; onPress?: () => void; elevated?: boolean }) {
  const { palette, mode } = useTheme();
  const inner = <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.divider }, elevated && shadow(mode), style]}>{children}</View>;
  return onPress ? <TouchableOpacity activeOpacity={0.82} onPress={onPress}>{inner}</TouchableOpacity> : inner;
}

export function ScreenHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  const { palette } = useTheme();
  return <View style={styles.header}>
    <View style={{ flex: 1 }}>
      <Text style={[styles.headerTitle, { color: palette.foreground }]}>{title}</Text>
      {subtitle ? <Text style={[styles.headerSub, { color: palette.foregroundMuted }]}>{subtitle}</Text> : null}
    </View>
    {right}
  </View>;
}

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  const { palette } = useTheme();
  return <View style={styles.sectionRow}><Text style={[styles.sectionTitle, { color: palette.foreground }]}>{title}</Text>{action}</View>;
}

export function Pill({ label, color, onPress }: { label: string; color?: string; onPress?: () => void }) {
  const { palette } = useTheme();
  const bg = color ? `${color}18` : palette.primarySoft;
  const fg = color ?? palette.primary;
  const node = <View style={[styles.pill, { backgroundColor: bg }]}><Text style={[styles.pillText, { color: fg }]} numberOfLines={1}>{label}</Text></View>;
  return onPress ? <TouchableOpacity activeOpacity={0.75} onPress={onPress}>{node}</TouchableOpacity> : node;
}

export function Loading({ label }: { label?: string }) {
  const { palette } = useTheme();
  return <View style={styles.center}><ActivityIndicator color={palette.primary} size="large" />{label ? <Text style={[styles.loadingText, { color: palette.foregroundMuted }]}>{label}</Text> : null}</View>;
}

export function EmptyState({ icon, title, desc }: { icon?: React.ReactNode; title: string; desc?: string }) {
  const { palette } = useTheme();
  return <View style={styles.center}>{icon}<Text style={[styles.emptyTitle, { color: palette.foreground }]}>{title}</Text>{desc ? <Text style={[styles.emptyDesc, { color: palette.foregroundMuted }]}>{desc}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm, flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: "800", letterSpacing: -0.3 },
  headerSub: { fontSize: fontSize.sm, marginTop: 3 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: "800", letterSpacing: -0.15 },
  pill: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, alignSelf: "flex-start" },
  pillText: { fontSize: fontSize.xs, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl, gap: spacing.sm },
  loadingText: { marginTop: spacing.sm, fontSize: fontSize.sm },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: "700", marginTop: spacing.sm },
  emptyDesc: { fontSize: fontSize.sm, textAlign: "center", marginTop: 4 },
});
