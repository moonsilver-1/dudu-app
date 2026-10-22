import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import BrowseScreen from '../screens/BrowseScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { ArticleScreen } from '../screens/ArticleScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function NotebookTabs({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10), backgroundColor: palette.surface, borderColor: palette.border }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const selected = state.index === index;
        const label = options.title ?? route.name;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            testID={options.tabBarButtonTestID}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!selected && !event.defaultPrevented) navigation.navigate(route.name, route.params);
            }}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.65 : 1 }]}
          >
            <Text style={[styles.tabLabel, { color: selected ? palette.primary : palette.foregroundMuted, fontWeight: selected ? '700' : '400' }]}>{label}</Text>
            <View style={[styles.tabUnderline, { backgroundColor: selected ? palette.primary : 'transparent' }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <NotebookTabs {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
      <Tab.Screen name="Browse" component={BrowseScreen} options={{ title: '分类' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: '搜索' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: '收藏' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: '我的' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Article" component={ArticleScreen} options={{ presentation: 'card', animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 4, paddingHorizontal: 10 },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 7 },
  tabLabel: { fontSize: 14, lineHeight: 20 },
  tabUnderline: { width: 18, height: 2, borderRadius: 1 },
});
