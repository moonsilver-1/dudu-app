import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Home,
  Compass,
  Search,
  Bookmark,
  Settings,
  type LucideIcon,
} from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing } from "../theme";
import { paletteFor } from "../theme";

import HomeScreen from "../screens/HomeScreen";
import BrowseScreen from "../screens/BrowseScreen";
import SearchScreen from "../screens/SearchScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { ArticleScreen } from "../screens/ArticleScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  const { mode } = useTheme();
  const palette = paletteFor(mode);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.foregroundSubtle,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarItemStyle: { borderRadius: radius.md },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "首页", tabBarIcon: icon(Home) }}
      />
      <Tab.Screen
        name="Browse"
        component={BrowseScreen}
        options={{ title: "分类", tabBarIcon: icon(Compass) }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: "搜索", tabBarIcon: icon(Search) }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: "收藏", tabBarIcon: icon(Bookmark) }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "我的", tabBarIcon: icon(Settings) }}
      />
    </Tab.Navigator>
  );
}

function icon(Icon: LucideIcon) {
  return ({
    color,
    size,
  }: {
    color: string;
    size: number;
  }) => <Icon size={size} color={color} />;
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen
          name="Article"
          component={ArticleScreen}
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
