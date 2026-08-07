import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sun, Moon, MoonStar, Info, Github, BookOpen } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, fontSize, fontFamily } from "../theme";
import { getAllArticles } from "../lib/content";
import { getReadSet } from "../lib/storage";
import { Card, ScreenHeader, Pill } from "../components/ui";

export default function SettingsScreen() {
  const { palette, mode, setPref, pref } = useTheme();
  const [readCount, setReadCount] = useState(0);

  useEffect(() => {
    getReadSet().then((s) => setReadCount(s.length));
  }, []);

  const Row = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string;
  }) => (
    <View style={[styles.row, { borderColor: palette.border }]}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={[styles.rowLabel, { color: palette.foreground }]}>{label}</Text>
      {value ? <Text style={[styles.rowValue, { color: palette.foregroundMuted }]}>{value}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ScreenHeader title="我的" subtitle="嘟嘟 DUDU · HDU 知识库" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.profile}>
          <Text style={styles.emoji}>🐑</Text>
          <Text style={[styles.profileName, { color: palette.foreground }]}>嘟嘟 DUDU</Text>
          <Text style={[styles.profileSub, { color: palette.foregroundMuted }]}>电子科技大学知识库离线阅读器</Text>
        </Card>

        <Card>
          <Text style={[styles.blockTitle, { color: palette.foreground }]}>外观</Text>
          <View style={styles.themeRow}>
            <TouchableOpacity
              onPress={() => setPref("light")}
              style={[styles.themeBtn, { backgroundColor: pref === "light" ? palette.primarySoft : palette.surfaceMuted }]}
            >
              <Sun size={18} color={palette.foreground} />
              <Text style={[styles.themeText, { color: palette.foreground }]}>浅色</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPref("dark")}
              style={[styles.themeBtn, { backgroundColor: pref === "dark" ? palette.primarySoft : palette.surfaceMuted }]}
            >
              <Moon size={18} color={palette.foreground} />
              <Text style={[styles.themeText, { color: palette.foreground }]}>深色</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPref("system")}
              style={[styles.themeBtn, { backgroundColor: pref === "system" ? palette.primarySoft : palette.surfaceMuted }]}
            >
              <MoonStar size={18} color={palette.foreground} />
              <Text style={[styles.themeText, { color: palette.foreground }]}>跟随系统</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: spacing.sm }}>
            <Pill label={mode === "dark" ? "当前：深色" : "当前：浅色"} />
          </View>
        </Card>

        <Card>
          <Text style={[styles.blockTitle, { color: palette.foreground }]}>关于</Text>
          <Row icon={<BookOpen size={18} color={palette.foregroundMuted} />} label="文章总数" value={`${getAllArticles().length}`} />
          <Row icon={<Info size={18} color={palette.foregroundMuted} />} label="已读文章" value={`${readCount}`} />
          <Row icon={<Github size={18} color={palette.foregroundMuted} />} label="数据来源" value="HDU Wiki" />
          <Row icon={<Info size={18} color={palette.foregroundMuted} />} label="版本" value="1.0.0" />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  profile: { alignItems: "center", gap: spacing.xs },
  emoji: { fontSize: 48 },
  profileName: { fontSize: fontSize.xl, fontWeight: "800" },
  profileSub: { fontSize: fontSize.sm },
  blockTitle: { fontSize: fontSize.lg, fontWeight: "700", marginBottom: spacing.sm },
  themeRow: { flexDirection: "row", gap: spacing.sm },
  themeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
  themeText: { fontSize: fontSize.sm, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: { width: 24, alignItems: "center" },
  rowLabel: { flex: 1, fontSize: fontSize.md },
  rowValue: { fontSize: fontSize.sm },
});
