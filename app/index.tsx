import React, { useEffect } from "react";
import { Image, StyleSheet, StatusBar, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const STRAWBERRY_BOLD = "#FF6B97"; 
const STRAWBERRY_LIGHT = "#FFB3C1"; 

export default function Index() {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/Welcome");
    }, 2000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={[STRAWBERRY_BOLD, STRAWBERRY_LIGHT]} style={styles.container}>
  <StatusBar barStyle="light-content" backgroundColor={STRAWBERRY_BOLD} />
  <View style={styles.mainWrapper}>
    <Image
      source={require("../assets/images/logo-cakelitycs.png")}
      style={styles.logoImage}
      resizeMode="contain"
    />
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
  logoImage: {
    width: 250,
    height: 150,
  },
});