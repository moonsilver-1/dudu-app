import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sun, Moon, MoonStar, Info, Github, BookOpen, RefreshCw, Download, Upload, Share2, Clock4 } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, fontSize, fontFamily } from "../theme";
import { getAllArticles } from "../lib/content";
import { getReadSet, exportBackup, importBackup, type BackupData } from "../lib/storage";
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

  /** 导出备份：收藏+进度+设置 → json 文件，调用系统分享 */
  const handleExport = async () => {
    try {
      const data = await exportBackup();
      const fileName = `dudu-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "导出嘟嘟备份",
          UTI: "public.json",
        });
      } else {
        Alert.alert("已导出", "备份文件已生成：" + fileUri);
      }
    } catch (e: any) {
      Alert.alert("导出失败", String(e?.message || e));
    }
  };

  /** 导入备份：从文件选择器选 json，恢复收藏+进度+设置 */
  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const data = JSON.parse(content) as BackupData;
      Alert.alert(
        "确认导入",
        `备份时间：${data.exportedAt?.slice(0, 10) || "未知"}\n收藏 ${data.favorites?.length ?? 0} 篇，进度 ${Object.keys(data.progress ?? {}).length} 篇。\n\n注意：会覆盖当前的收藏和进度。`,
        [
          { text: "取消", style: "cancel" },
          {
            text: "导入",
            style: "destructive",
            onPress: async () => {
              try {
                await importBackup(data);
                Alert.alert("导入成功 ✅", "请重新打开 App 让设置生效");
              } catch (err: any) {
                Alert.alert("导入失败", String(err?.message || err));
              }
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert("导入失败", String(e?.message || e));
    }
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
            <TouchableOpacity
              onPress={() => setPref("auto")}
              style={[styles.themeBtn, { backgroundColor: pref === "auto" ? palette.primarySoft : palette.surfaceMuted }]}
            >
              <Clock4 size={18} color={palette.foreground} />
              <Text style={[styles.themeText, { color: palette.foreground }]}>自动</Text>
            </TouchableOpacity>
          </View>
          {pref === "auto" ? (
            <Text style={[styles.autoHint, { color: palette.foregroundMuted }]}>
              晚上 8 点到早上 7 点自动切换深色 🌙
            </Text>
          ) : null}
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

        <Card>
          <Text style={[styles.blockTitle, { color: palette.foreground }]}>备份与迁移</Text>
          <Text style={[styles.backupHint, { color: palette.foregroundMuted }]}>
            导出收藏、阅读进度和设置到文件；换手机或重装时可导入恢复。
          </Text>
          <View style={styles.backupRow}>
            <TouchableOpacity
              onPress={handleExport}
              style={[styles.backupBtn, { backgroundColor: palette.primarySoft }]}
            >
              <Upload size={16} color={palette.primary} />
              <Text style={[styles.backupBtnText, { color: palette.primary }]}>导出备份</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleImport}
              style={[styles.backupBtn, { backgroundColor: palette.surfaceMuted }]}
            >
              <Download size={16} color={palette.foreground} />
              <Text style={[styles.backupBtnText, { color: palette.foreground }]}>导入备份</Text>
            </TouchableOpacity>
          </View>
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
  autoHint: { fontSize: fontSize.xs, marginTop: spacing.sm },
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
  backupHint: { fontSize: fontSize.sm, lineHeight: 20, marginBottom: spacing.md },
  backupRow: { flexDirection: "row", gap: spacing.sm },
  backupBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  backupBtnText: { fontSize: fontSize.sm, fontWeight: "700" },
});
