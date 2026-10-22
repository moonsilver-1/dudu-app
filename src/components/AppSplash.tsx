import React from "react";
import { View, Text, Image, StyleSheet, Animated, Easing } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { spacing, fontSize } from "../theme";

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
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <Animated.View style={{ opacity: markOpacity, transform: [{ scale: markScale }] }}><Image source={require('../../assets/wiki-sheep.png')} style={styles.sheep} resizeMode="contain" accessible={false} /></Animated.View>
      <Animated.View style={{ opacity: textOpacity, alignItems: "center" }}>
        <Text style={[styles.title, { color: palette.foreground }]}>嘟嘟</Text>
        <Text style={[styles.subtitle, { color: palette.foregroundMuted }]}>杭电 Wiki</Text>
      </Animated.View>
    </View>
  </Animated.View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, overflow: "hidden" },
  sheep: { width: 124, height: 124, borderRadius: 62 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: 1 },
  subtitle: { fontSize: fontSize.sm, marginTop: spacing.xs },
});
