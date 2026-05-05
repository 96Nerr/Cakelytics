import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function Cart() {
  return (
    <ThemedView style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">Cart</ThemedText>
      <ThemedText>View customer orders and cart management. Coming soon!</ThemedText>
    </ThemedView>
  );
}
