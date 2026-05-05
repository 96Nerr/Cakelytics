import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="Dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>{'🏠'}</Text>,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Produk',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>{'📦'}</Text>,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Keranjang',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>{'🛒'}</Text>,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics ',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>{'📊'}</Text>,
        }}
      />
      <Tabs.Screen
        name="modal"
        options={{
          title: 'Modal',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>{'🗂️'}</Text>,
        }}
      />
    </Tabs>
  );
}
