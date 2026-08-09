import React from "react";
import { Text } from "react-native";

/**
 * 把文本里的关键词高亮（红色标注）。
 * 用于搜索结果 snippet。
 */
export function HighlightText({
  text,
  query,
  baseColor,
  highlightColor = "#DC2626",
  style,
}: {
  text: string;
  query: string;
  baseColor?: string;
  highlightColor?: string;
  style?: any;
}) {
  const q = query.trim();
  if (!q) {
    return <Text style={[style, { color: baseColor }]}>{text}</Text>;
  }
  // 把多个关键词（空格分隔）都高亮，转义正则特殊字符
  const terms = q.split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (terms.length === 0) {
    return <Text style={[style, { color: baseColor }]}>{text}</Text>;
  }
  const re = new RegExp(`(${terms.join("|")})`, "gi");
  const parts = text.split(re);
  return (
    <Text style={[style, { color: baseColor }]}>
      {parts.map((part, i) =>
        re.test(part) ? (
          <Text key={i} style={{ color: highlightColor, fontWeight: "700" }}>
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
