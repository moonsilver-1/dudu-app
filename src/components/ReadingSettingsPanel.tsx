import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Check, X } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useReadingSettings } from "../context/ReadingSettingsContext";
import { radius, spacing, fontSize } from "../theme";

const FONT_SCALES = [
  { label: "小", value: 0.85 },
  { label: "中", value: 1 },
  { label: "大", value: 1.15 },
  { label: "超大", value: 1.3 },
];
const LINE_HEIGHTS = [
  { label: "紧凑", value: 1.6 },
  { label: "标准", value: 1.9 },
  { label: "宽松", value: 2.1 },
];

export function ReadingSettingsPanel({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { palette } = useTheme();
  const { settings, update } = useReadingSettings();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={[styles.sheet, { backgroundColor: palette.surface }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.foreground }]}>阅读设置</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="关闭阅读设置" onPress={onClose} hitSlop={10}>
              <X size={22} color={palette.foregroundMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: palette.foregroundMuted }]}>字号</Text>
          <View style={styles.optionRow}>
            {FONT_SCALES.map((opt) => {
              const active = Math.abs(settings.fontScale - opt.value) < 0.01;
              return (
                <TouchableOpacity
                  key={opt.label}
                  onPress={() => update({ fontScale: opt.value })}
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor: active ? palette.primarySoft : palette.surfaceMuted,
                      borderColor: active ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? palette.primary : palette.foreground,
                      fontWeight: "700",
                      fontSize: fontSize.sm * opt.value,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { color: palette.foregroundMuted }]}>行距</Text>
          <View style={styles.optionRow}>
            {LINE_HEIGHTS.map((opt) => {
              const active = Math.abs(settings.lineHeight - opt.value) < 0.01;
              return (
                <TouchableOpacity
                  key={opt.label}
                  onPress={() => update({ lineHeight: opt.value })}
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor: active ? palette.primarySoft : palette.surfaceMuted,
                      borderColor: active ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <Text style={{ color: active ? palette.primary : palette.foreground, fontWeight: "700" }}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={() => update({ eyeCare: !settings.eyeCare })}
            style={[
              styles.toggleRow,
              { backgroundColor: settings.eyeCare ? palette.primarySoft : palette.surfaceMuted, borderColor: palette.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: palette.foreground }]}>护眼模式</Text>
              <Text style={[styles.toggleDesc, { color: palette.foregroundMuted }]}>
                米黄色背景，长时间阅读更舒服（深色模式下无效）
              </Text>
            </View>
            {settings.eyeCare ? <Check size={20} color={palette.primary} /> : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  title: { fontSize: fontSize.xl, fontWeight: "800" },
  label: { fontSize: fontSize.sm, fontWeight: "700", marginTop: spacing.xs },
  optionRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  optionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  toggleTitle: { fontSize: fontSize.md, fontWeight: "700" },
  toggleDesc: { fontSize: fontSize.xs, marginTop: 2 },
});
