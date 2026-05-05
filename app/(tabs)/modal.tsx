import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">Modal 🗂️</ThemedText>
      <ThemedText>Folder dan modal content here.</ThemedText>
    </ThemedView>
  );
}
