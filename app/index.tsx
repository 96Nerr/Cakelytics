import React, { useEffect } from "react";
import { StyleSheet, StatusBar, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const STRAWBERRY_BOLD = "#FF6B97"; 
const STRAWBERRY_LIGHT = "#FFB3C1"; 

export default function Index() {
  
  useEffect(() => {
    // Menahan layar selama 2 detik sebelum pindah ke halaman Welcome
    const timer = setTimeout(() => {
      router.replace("/Welcome");
    }, 2000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={[STRAWBERRY_BOLD, STRAWBERRY_LIGHT]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={STRAWBERRY_BOLD} />
      
      {/* TAMPILAN MINIMALIS: Cuma Tulisan Brand Saja */}
      <View style={styles.mainWrapper}>
        <Text style={styles.textBrand}>
          Cakelytics
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  mainWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  textBrand: {
    fontSize: 36, // Ukurannya dinaikkan sedikit menjadi 36 agar lebih tegas karena berdiri sendiri
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1.5, // Memberi sedikit jarak antar huruf biar estetikanya makin premium
  },
});