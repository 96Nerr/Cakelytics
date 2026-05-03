import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        
        <View style={styles.header}>
          <Text style={styles.logo}>Cakelytics</Text>

          <Text style={styles.date}>Rabu, 8 April 2026</Text>

          <Text style={styles.greeting}>GOOD MORNING</Text>
        </View>


        <View style={styles.incomeCard}>
          <Text style={styles.cardTitle}>Pendapatan Hari ini</Text>

          <Text style={styles.amount}>1.999.200,00</Text>

          <Text style={styles.increase}>↗ Naik Rp 1.267.000</Text>
        </View>


        
        <View style={styles.warningRed}>
          <Text style={styles.warningRedText}>
             1 Produk Habis Stok!
          </Text>

          <Text style={styles.arrow}>→</Text>
        </View>


        <View style={styles.warningYellow}>
          <Text style={styles.warningYellowText}>
             Stok Hampir Habis!
          </Text>

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
            <Text style={styles.bestSellerTitle}> Produk Terlaris</Text>

            <TouchableOpacity>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>


          {/* ITEM 1 */}
          <View style={styles.productRow}>
            <Text style={styles.productName}> Soft Cookies</Text>

            <Text style={styles.productSold}>8 Terjual</Text>
          </View>


          {/* ITEM 2 */}
          <View style={styles.productRow}>
            <Text style={styles.productName}> Cheesecake</Text>

            <Text style={styles.productSold}>6 Terjual</Text>
          </View>


          {/* ITEM 3 */}
          <View style={styles.productRow}>
            <Text style={styles.productName}> Truffle</Text>

            <Text style={styles.productSold}>5 Terjual</Text>
          </View>
        </View>
      </ScrollView>


      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <Text style={styles.navIcon}>🏠</Text>
        <Text style={styles.navIcon}>📦</Text>
        <Text style={styles.navIcon}>🛒</Text>
        <Text style={styles.navIcon}>📊</Text>
        <Text style={styles.navIcon}>📚</Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E88D8D",
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  logo: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },

  date: {
    color: "#FFEAEA",
    marginBottom: 5,
  },

  greeting: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },

  incomeCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
  },

  cardTitle: {
    fontSize: 16,
    color: "#444",
    marginBottom: 10,
  },

  amount: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 10,
  },

  increase: {
    color: "green",
    fontSize: 14,
  },

  warningRed: {
    backgroundColor: "#FFDCDC",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  warningRedText: {
    color: "red",
    fontWeight: "600",
  },

  arrow: {
    fontSize: 20,
    color: "red",
  },

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

  warningYellowText: {
    color: "#A27B00",
    fontWeight: "600",
  },

  arrowYellow: {
    fontSize: 20,
    color: "#A27B00",
  },

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

  statsIcon: {
    fontSize: 28,
    marginBottom: 10,
  },

  statsNumber: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111",
  },

  statsLabel: {
    marginTop: 5,
    color: "#666",
  },

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

  bestSellerTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },

  seeAll: {
    color: "red",
    fontWeight: "600",
  },

  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  productName: {
    color: "#333",
  },

  productSold: {
    color: "#666",
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 18,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  navIcon: {
    fontSize: 24,
  },
});