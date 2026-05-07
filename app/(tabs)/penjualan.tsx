import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function Laporan() {
  return (
    <ThemedView style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">cuki</ThemedText>
      <ThemedText>Sales and business analytics dashboard. Coming soon Suki</ThemedText>
    </ThemedView>
  );
}
