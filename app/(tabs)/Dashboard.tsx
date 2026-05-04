import React, { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export default function Index() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>Cakelytics</Text>
          <Text style={styles.date}>Rabu, 8 April 2026</Text>
          <Text style={styles.greeting}>GOOD MORNING</Text>
        </View>

        {/* INCOME CARD */}
        <View style={styles.incomeCard}>
          <Text style={styles.cardTitle}>Pendapatan Hari ini</Text>
          <Text style={styles.amount}>Rp 1.999.200</Text>
          <Text style={styles.increase}>↗ Naik Rp 1.267.000</Text>
        </View>

        {/* WARNING CARDS */}
        <View style={styles.warningRed}>
          <Text style={styles.warningRedText}>1 Produk Habis Stok!</Text>
          <Text style={styles.arrow}>→</Text>
        </View>

        <View style={styles.warningYellow}>
          <Text style={styles.warningYellowText}>Stok Hampir Habis!</Text>
          <Text style={styles.arrowYellow}>→</Text>
        </View>

        {/* STATS */}
        <View style={styles.statsContainer}>
          <View style={styles.statsBlue}>
            <Text style={styles.statsIcon}>📦</Text>
            <Text style={styles.statsNumber}>5</Text>
            <Text style={styles.statsLabel}>Jenis Kue</Text>
          </View>

          <View style={styles.statsPink}>
            <Text style={styles.statsIcon}>🧾</Text>
            <Text style={styles.statsNumber}>10</Text>
            <Text style={styles.statsLabel}>Penjualan</Text>
          </View>
        </View>

        {/* BEST SELLER */}
        <View style={styles.bestSellerCard}>
          <View style={styles.bestSellerHeader}>
            <Text style={styles.bestSellerTitle}>Produk Terlaris</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productRow}>
            <Text style={styles.productName}>Soft Cookies</Text>
            <Text style={styles.productSold}>8 Terjual</Text>
          </View>

          <View style={styles.productRow}>
            <Text style={styles.productName}>Cheesecake</Text>
            <Text style={styles.productSold}>6 Terjual</Text>
          </View>

          <View style={styles.productRow}>
            <Text style={styles.productName}>Truffle</Text>
            <Text style={styles.productSold}>5 Terjual</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  warningRedText: { color: "red", fontWeight: "600" },
  arrow: { fontSize: 20, color: "red" },
  warningYellow: {
    backgroundColor: "#F5E9B8",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  warningYellowText: { color: "#A27B00", fontWeight: "600" },
  arrowYellow: { fontSize: 20, color: "#A27B00" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statsBlue: {
    backgroundColor: "#C7F2F3",
    width: "47%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  statsPink: {
    backgroundColor: "#FFD7D7",
    width: "47%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  statsIcon: { fontSize: 28, marginBottom: 10 },
  statsNumber: { fontSize: 30, fontWeight: "bold", color: "#111" },
  statsLabel: { marginTop: 5, color: "#666" },
  bestSellerCard: {
    backgroundColor: "#F3F3F3",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 120,
  },
  bestSellerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  bestSellerTitle: { fontWeight: "bold", fontSize: 16 },
  seeAll: { color: "red", fontWeight: "600" },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  productName: { color: "#333" },
  productSold: { color: "#666" },
});