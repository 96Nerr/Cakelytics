import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export default function Index() {

  useEffect(() => {
    setTimeout(() => {
      router.replace("/welcome");
    }, 3000);
  }, []);

  return (
    <LinearGradient
      colors={["#ff4d6d", "#ffffff"]}
      style={styles.container}
    >
      <Text style={styles.title}>Cakølitycs</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 32,
    color: "#ffffff",
    fontWeight: "bold",
  },
});