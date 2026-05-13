import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. Halaman Pertama (Splash) */}
      <Stack.Screen name="index" /> 
      
      {/* 2. Halaman Kedua (Welcome) */}
      <Stack.Screen name="welcome" /> 
      
      {/* 3. Masuk ke Grup Dashboard/Tabs */}
      <Stack.Screen name="(tabs)" /> 
      
      {/* 4. Modal Global (Optional) */}
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}