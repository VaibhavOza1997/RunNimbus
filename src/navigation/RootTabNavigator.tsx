import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import PlayStackNavigator from './PlayStackNavigator';
import ProfileScreen from '@/screens/Profile/ProfileScreen';
import CloudyScreen from '@/screens/Profile/CloudyScreen';
import LeaderboardScreen from '@/screens/Social/LeaderboardScreen';
import { Colors, Typography } from '@/theme';

export type RootTabParamList = {
  Home: undefined;
  Play: undefined;
  CloudyTab: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠',
    Play: '▶️',
    CloudyTab: '☁️',
    Leaderboard: '🏆',
    Profile: '👤',
  };
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
        {icons[label] ?? '•'}
      </Text>
    </View>
  );
}

export default function RootTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 0.5,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint="dark"
              intensity={80}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
          ) : null,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: { ...Typography.caption2, marginBottom: 2 },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={PlayStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="Play" component={PlayStackNavigator} options={{ title: 'Play' }} />
      <Tab.Screen name="CloudyTab" component={CloudyScreen} options={{ title: 'Cloudy' }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Ranks' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
