import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.box}>
          <Text style={styles.title}>应用出错了 😢</Text>
          <Text style={styles.hint}>请把下面的报错文字发给我，我来修：</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.msg}>{String(this.state.error?.stack || this.state.error)}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: "#0B1220",
    padding: 24,
    paddingTop: 64,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  hint: {
    color: "#9aa4b2",
    fontSize: 14,
    marginBottom: 12,
  },
  scroll: {
    flex: 1,
  },
  msg: {
    color: "#ff8a8a",
    fontSize: 12,
    fontFamily: "monospace",
  },
});
