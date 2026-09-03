import React from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { spacing, fontSize, radius } from "../theme";

export function AppSplash({ onDone }: { onDone: () => void }) {
  const { palette } = useTheme();
  const opacity = React.useRef(new Animated.Value(1)).current;
  const markScale = React.useRef(new Animated.Value(0.72)).current;
  const markOpacity = React.useRef(new Animated.Value(0)).current;
  const textOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(markOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(markScale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.delay(280),
      Animated.timing(opacity, { toValue: 0, duration: 240, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) onDone(); });
  }, [markOpacity, markScale, opacity, textOpacity, onDone]);

  return <Animated.View style={[StyleSheet.absoluteFill, { opacity, zIndex: 20 }]}> 
    <View style={[styles.root, { backgroundColor: palette.heroStart }]}>
      <View style={[styles.glow, { backgroundColor: palette.heroEnd }]} />
      <Animated.View style={[styles.mark, { opacity: markOpacity, transform: [{ scale: markScale }] }]}><Text style={styles.markText}>🐑</Text></Animated.View>
      <Animated.View style={{ opacity: textOpacity, alignItems: "center" }}>
        <Text style={styles.title}>嘟嘟 DUDU</Text>
        <Text style={styles.subtitle}>HDU 知识库 · 离线阅读</Text>
      </Animated.View>
      <View style={styles.dots}><View style={[styles.dot, { backgroundColor: palette.primaryStrong }]} /><View style={[styles.dot, { backgroundColor: "rgba(255,255,255,.45)" }]} /><View style={[styles.dot, { backgroundColor: "rgba(255,255,255,.25)" }]} /></View>
    </View>
  </Animated.View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, overflow: "hidden" },
  glow: { position: "absolute", width: 420, height: 420, borderRadius: 210, opacity: 0.45, top: -160, right: -120 },
  mark: { width: 92, height: 92, borderRadius: radius.xl, backgroundColor: "rgba(255,255,255,.14)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,.28)" },
  markText: { fontSize: 48 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: 0.4 },
  subtitle: { color: "rgba(255,255,255,.72)", fontSize: fontSize.sm, marginTop: spacing.xs },
  dots: { position: "absolute", bottom: 64, flexDirection: "row", gap: spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
