import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, fontSize, shadow } from "../theme";

/** 通用卡片容器 */
export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
}) {
  const { palette, mode } = useTheme();
  const Inner = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          ...(shadow(mode) as object),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
  return onPress ? (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      {Inner}
    </TouchableOpacity>
  ) : (
    Inner
  );
}

/** 屏幕顶部大标题区 */
export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const { palette } = useTheme();
  return (
    <View style={[styles.header, { borderColor: palette.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.headerTitle, { color: palette.foreground }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.headerSub, { color: palette.foregroundMuted }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}

/** 标签药丸 */
export function Pill({
  label,
  color,
  onPress,
}: {
  label: string;
  color?: string;
  onPress?: () => void;
}) {
  const { palette } = useTheme();
  const bg = color ?? palette.primarySoft;
  const fg = color ?? palette.primary;
  const node = (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
  return onPress ? (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      {node}
    </TouchableOpacity>
  ) : (
    node
  );
}

/** 加载占位 */
export function Loading({ label }: { label?: string }) {
  const { palette } = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={palette.primary} size="large" />
      {label && (
        <Text style={[styles.loadingText, { color: palette.foregroundMuted }]}>
          {label}
        </Text>
      )}
    </View>
  );
}

/** 空状态 */
export function EmptyState({
  icon,
  title,
  desc,
}: {
  icon?: React.ReactNode;
  title: string;
  desc?: string;
}) {
  const { palette } = useTheme();
  return (
    <View style={styles.center}>
      {icon}
      <Text style={[styles.emptyTitle, { color: palette.foreground }]}>
        {title}
      </Text>
      {desc && (
        <Text style={[styles.emptyDesc, { color: palette.foregroundMuted }]}>
          {desc}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  pill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: "flex-start",
  },
  pillText: { fontSize: fontSize.xs, fontWeight: "600" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  loadingText: { marginTop: spacing.sm, fontSize: fontSize.sm },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: "700", marginTop: spacing.sm },
  emptyDesc: { fontSize: fontSize.sm, textAlign: "center", marginTop: 4 },
});
