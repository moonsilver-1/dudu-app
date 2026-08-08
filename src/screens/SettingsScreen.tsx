import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sun, Moon, MoonStar, Info, Github, BookOpen, RefreshCw, Download } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, fontSize, fontFamily } from "../theme";
import { getAllArticles } from "../lib/content";
import { getReadSet } from "../lib/storage";
import { Card, ScreenHeader, Pill } from "../components/ui";
import { checkForUpdate, LOCAL_VERSION } from "../lib/update";

export default function SettingsScreen() {
  const { palette, mode, setPref, pref } = useTheme();
  const [readCount, setReadCount] = useState(0);
  const [checking, setChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{ hasUpdate: boolean; version?: string; url?: string; changelog?: string } | null>(null);

  useEffect(() => {
    getReadSet().then((s) => setReadCount(s.length));
  }, []);

  const handleCheckUpdate = async () => {
    setChecking(true);
    setUpdateInfo(null);
    const result = await checkForUpdate();
    setChecking(false);
    if (result.error) {
      Alert.alert("检查失败", "无法连接服务器，请稍后再试。\n\n错误：" + result.error);
      return;
    }
    setUpdateInfo({
      hasUpdate: result.hasUpdate,
      version: result.remote?.version,
      url: result.remote?.url,
      changelog: result.remote?.changelog,
    });
    if (!result.hasUpdate) {
      Alert.alert("已是最新版本 ✨", `当前版本 v${LOCAL_VERSION}`);
    }
  };

  const openDownload = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

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
          <Row icon={<Info size={18} color={palette.foregroundMuted} />} label="版本" value={`v${LOCAL_VERSION}`} />
        </Card>

        <Card>
          <Text style={[styles.blockTitle, { color: palette.foreground }]}>更新</Text>
          <TouchableOpacity
            onPress={handleCheckUpdate}
            disabled={checking}
            style={[styles.updateBtn, { backgroundColor: palette.primarySoft }]}
          >
            {checking ? (
              <ActivityIndicator size="small" color={palette.primary} />
            ) : (
              <RefreshCw size={16} color={palette.primary} />
            )}
            <Text style={[styles.updateBtnText, { color: palette.primary }]}>
              {checking ? "检查中…" : "检查更新"}
            </Text>
          </TouchableOpacity>

          {updateInfo?.hasUpdate && updateInfo.url ? (
            <View style={[styles.updateBox, { borderColor: palette.primary, backgroundColor: palette.primarySoft }]}>
              <Text style={[styles.updateNewVer, { color: palette.primary }]}>
                发现新版本 v{updateInfo.version} 🎉
              </Text>
              {updateInfo.changelog ? (
                <Text style={[styles.updateChangelog, { color: palette.foreground }]}>
                  {updateInfo.changelog.replace(/\\n/g, "\n")}
                </Text>
              ) : null}
              <TouchableOpacity
                onPress={() => openDownload(updateInfo.url!)}
                style={[styles.downloadBtn, { backgroundColor: palette.primary }]}
              >
                <Download size={16} color="#fff" />
                <Text style={styles.downloadBtnText}>下载新版 APK</Text>
              </TouchableOpacity>
              <Text style={[styles.updateHint, { color: palette.foregroundMuted }]}>
                下载后点开安装，覆盖即可（收藏/进度会保留）
              </Text>
            </View>
          ) : null}
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
  updateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  updateBtnText: { fontSize: fontSize.md, fontWeight: "700" },
  updateBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  updateNewVer: { fontSize: fontSize.lg, fontWeight: "800" },
  updateChangelog: { fontSize: fontSize.sm, lineHeight: 20 },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  downloadBtnText: { color: "#fff", fontSize: fontSize.sm, fontWeight: "700" },
  updateHint: { fontSize: fontSize.xs, marginTop: 2 },
});
