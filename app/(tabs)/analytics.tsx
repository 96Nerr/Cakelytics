import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function Analytics() {
  return (
    <ThemedView style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">Analytics</ThemedText>
      <ThemedText>Sales and business analytics dashboard. Coming soon!</ThemedText>
    </ThemedView>
  );
}
