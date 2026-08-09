import React, { useRef } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from "react-native";
import ViewShot from "react-native-view-shot";
import QRCode from "react-native-qrcode-svg";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { X, Share2 as ShareIcon } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, fontSize } from "../theme";
import type { ArticleMeta } from "../lib/content";

/**
 * 分享卡片：把文章标题/摘要/二维码渲染成一张图，截图后调系统分享。
 * 用户可分享到微信/QQ/保存相册。
 */
export function ShareCard({
  visible,
  article,
  onClose,
}: {
  visible: boolean;
  article: ArticleMeta | null;
  onClose: () => void;
}) {
  const { palette } = useTheme();
  const shotRef = useRef<ViewShot>(null);

  if (!article) return null;
  const link = "https://hdu-wiki.cn/article/" + article.slug;

  const handleShare = async () => {
    try {
      if (!shotRef.current) return;
      const uri = await shotRef.current.capture({ result: "tmpfile", format: "png", quality: 1 });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("无法分享", "本设备不支持系统分享");
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "分享「" + article.title + "」",
      });
    } catch (e: any) {
      Alert.alert("分享失败", String(e?.message || e));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={styles.center}>
          {/* 被截图的卡片 */}
          <ViewShot
            ref={shotRef}
            options={{ format: "png", quality: 1 }}
            style={[styles.card, { backgroundColor: "#FFFFFF" }]}
          >
            <View style={styles.cardInner}>
              <Text style={styles.cardBrand}>🐑 嘟嘟 DUDU</Text>
              <Text style={styles.cardTitle} numberOfLines={3}>
                {article.title}
              </Text>
              {article.excerpt ? (
                <Text style={styles.cardExcerpt} numberOfLines={4}>
                  {article.excerpt}
                </Text>
              ) : null}
              {article.author ? (
                <Text style={styles.cardAuthor}>✍ {article.author}</Text>
              ) : null}
              <View style={styles.cardFoot}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardFootTitle}>扫码阅读全文</Text>
                  <Text style={styles.cardFootSub}>hdu-wiki.cn</Text>
                </View>
                <View style={styles.qrWrap}>
                  <QRCode value={link} size={76} backgroundColor="#FFFFFF" color="#0B1220" />
                </View>
              </View>
            </View>
          </ViewShot>

          {/* 操作按钮（不进入截图） */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleShare}
              style={[styles.shareBtn, { backgroundColor: palette.primary }]}
            >
              <ShareIcon size={18} color="#fff" />
              <Text style={styles.shareBtnText}>分享图片</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={palette.foreground} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  card: {
    width: 320,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  cardInner: {
    padding: spacing.xl,
    gap: spacing.sm,
    backgroundColor: "#FFFFFF",
  },
  cardBrand: {
    fontSize: fontSize.sm,
    fontWeight: "800",
    color: "#2563EB",
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: "#1A1A1A",
    lineHeight: 30,
  },
  cardExcerpt: {
    fontSize: fontSize.sm,
    color: "#555555",
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  cardAuthor: {
    fontSize: fontSize.xs,
    color: "#8C8C8C",
    marginTop: spacing.sm,
  },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E8E6E0",
    gap: spacing.md,
  },
  cardFootTitle: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  cardFootSub: {
    fontSize: fontSize.xs,
    color: "#8C8C8C",
    marginTop: 2,
  },
  qrWrap: {
    padding: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.sm,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  shareBtnText: { color: "#fff", fontSize: fontSize.md, fontWeight: "700" },
  closeBtn: {
    padding: spacing.md,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
