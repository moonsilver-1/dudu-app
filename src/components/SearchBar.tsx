import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Search, X } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, fontSize } from "../theme";

/** 通用搜索框 */
export function SearchBar({
  value,
  onChange,
  placeholder = "搜索文章…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { palette } = useTheme();
  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
      ]}
    >
      <Search size={18} color={palette.foregroundSubtle} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={palette.foregroundSubtle}
        style={[styles.input, { color: palette.foreground }]}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <TouchableOpacity onPress={() => onChange("")} hitSlop={8}>
          <X size={18} color={palette.foregroundSubtle} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  input: { flex: 1, fontSize: fontSize.md },
});
