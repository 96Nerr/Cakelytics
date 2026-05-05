import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function Home() {
  return (
    <LinearGradient
      colors={["#e65994", "#FFFFFF"]} 
      style={styles.container}
    >
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

        {/* WARNING CARDS */}
        <View style={styles.warningRed}>
          <Text style={styles.warningIconRed}>❌</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningRedText}>1 Produk Habis Stok!</Text>
            <Text style={styles.warningDetail}>Truffle</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="red" />
        </View>

        <View style={styles.warningYellow}>
          <Text style={styles.warningIconYellow}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningYellowText}>Stok Hampir Habis!</Text>
            <Text style={styles.warningDetail}>Soft Cookies (2)</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#A27B00" />
        </View>

        {/* STATS */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsIcon}>📦</Text>
            <View style={styles.statsContent}>
              <Text style={styles.statsTitle}>Total Produk</Text>
              <Text style={styles.statsNumber}>5</Text>
              <Text style={styles.statsLabel}>Jenis Kue</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsIcon}>🧾</Text>
            <View style={styles.statsContent}>
              <Text style={styles.statsTitle}>Transaksi Hari Ini</Text>
              <Text style={styles.statsNumber}>10</Text>
              <Text style={styles.statsLabel}>Penjualan</Text>
            </View>
          </View>
        </View>

        {/* BEST SELLER */}
        <View style={styles.bestSellerCard}>
          <View style={styles.bestSellerHeader}>
            <Text style={styles.bestSellerTitle}> Produk Terlaris</Text>
            <Text style={styles.seeAll}>Lihat Semua</Text>
          </View>

          <View style={styles.productRow}>
            <Text style={styles.productName}> Soft Cookies</Text>
            <Text style={styles.productSold}>8 Terjual</Text>
          </View>

          <View style={styles.productRow}>
            <Text style={styles.productName}> Cheesecake</Text>
            <Text style={styles.productSold}>6 Terjual</Text>
          </View>

          <View style={styles.productRow}>
            <Text style={styles.productName}> Truffle</Text>
            <Text style={styles.productSold}>5 Terjual</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d49f9f",
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
    padding: 15,
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
    borderRadius: 15,
    padding: 10,
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
    borderRadius: 15,
    padding: 10,
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
warningContent: {
  flex: 1,            // biar isi teks ambil ruang di tengah
  marginLeft: 10,     // jarak dari ikon
},

warningIconRed: {
  fontSize: 22,
  color: "red",
},

warningIconYellow: {
  fontSize: 22,
  color: "#A27B00",
},

warningDetail: {
  fontSize: 13,
  color: "#666",
  marginTop: 2,
},

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
  },

 statsCard: {
  backgroundColor: "#FFD7D7",
  width: "48%",
  borderRadius: 20,
  padding: 3,
  flexDirection: "row",   // ✅ ikon kiri, teks kanan
  alignItems: "center",
},

statsIcon: {
  fontSize: 32,
  marginRight: 5,
  color: "#E44D4D",
},

statsContent: {
  flex: 1,
},

statsTitle: {
  fontSize: 12,
  fontWeight: "600",
  color: "#b12727",
  marginBottom: 2,
},

statsNumber: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#111",
},

statsLabel: {
  color: "#666",
  fontSize: 13,
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
    color: "#d6cfcf",
  },
});
