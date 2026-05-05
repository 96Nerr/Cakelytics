import { router } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

export default function Welcome() {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image
          source={require("../assets/images/kue.png")}
          style={styles.cake}
        />
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.title}>Welcome to Cakelytics</Text>

        <Text style={styles.description}>
          An efficient system to manage cake orders, inventory,
          and your dessert business in one integrated platform.
        </Text>

       <TouchableOpacity
  style={styles.button}
  onPress={() => router.replace("/(tabs)/Dashboard")}
>
  <Text style={styles.buttonText}>Continue</Text>
</TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E88D8D",
  },

  topSection: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  cake: {
    width: 220,
    height: 220,
    resizeMode: "contain",
  },

  bottomSection: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  description: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 40,
  },

  button: {
    backgroundColor: "#ffffff",
    paddingVertical: 15,
    borderRadius: 40,
    alignItems: "center",
  },

  buttonText: {
    color: "#ff4d8d",
    fontWeight: "bold",
    fontSize: 16,
  },
});