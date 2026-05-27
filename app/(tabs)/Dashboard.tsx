import React, { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

const BASE_URL = "http://192.168.254.103:5000/api";

export default function Index() {
  const router = useRouter(); 
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    pendapatanHariIni: 0,
    totalTransaksiHariIni: 0,
    totalJenisProduk: 0,
    produkTerlaris: [] as any[],
    produkHabis: [] as string[],
    produkHampirHabis: [] as string[],
  });

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [resTransaksi, resProduk] = await Promise.all([
        fetch(`${BASE_URL}/transaksi`),
        fetch(`${BASE_URL}/produk`),
      ]);

      const transaksi: any[] = await resTransaksi.json();
      const produk: any[] = await resProduk.json();

      const todayStr = new Date().toISOString().split("T")[0];

      let pendapatanHariIni = 0;
      let totalTransaksiHariIni = 0;
      const produkMap: any = {};

      // 1. PROSES DATA TRANSAKSI
      transaksi.forEach((trx: any) => {
        const trxDateStr = trx.tanggalTransaksi?.split("T")[0];

        if (trxDateStr === todayStr) {
          pendapatanHariIni += trx.totalPenjualan || 0;
          totalTransaksiHariIni += 1;
        }

        trx.detailPenjualan?.forEach((item: any) => {
          const nama = item?.produk?.namaProduk || "Produk Tidak Diketahui";
          if (!produkMap[nama]) {
            produkMap[nama] = { nama, qty: 0 };
          }
          produkMap[nama].qty += item.jumlah || 0;
        });
      });

      const sortedProdukTerlaris = Object.values(produkMap)
        .sort((a: any, b: any) => b.qty - a.qty)
        .slice(0, 3);

      // 2. PROSES ALARM STOK (Produk Habis & Hampir Habis)
      const produkHabis: string[] = [];
      const produkHampirHabis: string[] = [];
      const produkTerurut = [...produk].sort((a: any, b: any) => a.stok - b.stok);
      produkTerurut.forEach((prod: any) => {
        if (prod.stok === 0) {
          produkHabis.push(prod.namaProduk);
        } else if (prod.stok > 0 && prod.stok < 10) {
          produkHampirHabis.push(`${prod.namaProduk} (${prod.stok} pcs)`);
        }
      });

      setDashboardData({
        pendapatanHariIni,
        totalTransaksiHariIni,
        totalJenisProduk: produk.length,
        produkTerlaris: sortedProdukTerlaris,
        produkHabis,
        produkHampirHabis,
      });
    } catch (error) {
      console.log("ERROR FETCH DASHBOARD DATA:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (number: number) => {
    return "Rp " + number.toLocaleString("id-ID");
  };

  if (loading) {
    return (
      <LinearGradient colors={["#FF6B97", "#FFF5F7"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#FF6B97", "#FFF5F7"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Image 
            source={require("../../assets/images/logo-cakelitycs.png")}
            style={styles.logoImage} 
            resizeMode="contain"
          />
          <Text style={styles.date}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </Text>
          <Text style={styles.greeting}>Serving sweet vibes and big energy!✨</Text>
        </View>

        <View style={styles.incomeCard}>
          <Text style={styles.cardTitle}>Pendapatan Hari Ini</Text>
          <Text style={styles.amount}>{formatRupiah(dashboardData.pendapatanHariIni)}</Text>
          <Text style={styles.increase}>↗ Realtime Database Sync</Text>
        </View>

        {/* WARNING CARDS */}
        {dashboardData.produkHabis.length > 0 && (
          <TouchableOpacity
            style={styles.warningRed}
            onPress={() => router.push({ pathname: "/manajemen", params: { filter: "habis" } })}
            activeOpacity={0.7}
          >
            <Text style={styles.warningIconRed}>❌</Text>
            <View style={styles.warningContent}>
              <Text style={styles.warningRedText}>{dashboardData.produkHabis.length} Produk Habis Stok!</Text>
              <Text style={styles.warningDetail}>{dashboardData.produkHabis.join(", ")}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#CC3838" />
          </TouchableOpacity>
        )}

        {dashboardData.produkHampirHabis.length > 0 && (
          <TouchableOpacity
            style={styles.warningYellow}
            onPress={() => router.push({ pathname: "/manajemen", params: { filter: "menipis" } })}
            activeOpacity={0.7}
          >
            <Text style={styles.warningIconYellow}>⚠️</Text>
            <View style={styles.warningContent}>
              <Text style={styles.warningYellowText}>Stok Hampir Habis!</Text>
              <Text style={styles.warningDetail}>{dashboardData.produkHampirHabis.join(", ")}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#856404" />
          </TouchableOpacity>
        )}

        {/* STATS */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsIcon}>📦</Text>
            <View style={styles.statsContent}>
              <Text style={styles.statsTitle}>Total Produk</Text>
              <Text style={styles.statsNumber}>{dashboardData.totalJenisProduk}</Text>
              <Text style={styles.statsLabel}>Jenis Kue</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsIcon}>🧾</Text>
            <View style={styles.statsContent}>
              <Text style={styles.statsTitle}>Transaksi Hari Ini</Text>
              <Text style={styles.statsNumber}>{dashboardData.totalTransaksiHariIni}</Text>
              <Text style={styles.statsLabel}>Penjualan</Text>
            </View>
          </View>
        </View>

        {/* BEST SELLER */}
        <View style={styles.bestSellerCard}>
          <View style={styles.bestSellerHeader}>
            <Text style={styles.bestSellerTitle}>Produk Terlaris</Text>
            <TouchableOpacity onPress={() => router.push("/laporan")}>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {dashboardData.produkTerlaris.length > 0 ? (
            dashboardData.produkTerlaris.map((item: any, index: number) => (
              <View key={index} style={styles.productRow}>
                <Text style={styles.productName}>{index + 1}. {item.nama}</Text>
                <Text style={styles.productSold}>{item.qty} Terjual</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Belum ada data penjualan</Text>
          )}
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingTop: 20, paddingHorizontal: 20, marginBottom: 5 },
  logoImage: { width: 180, height: 60, marginBottom: -8, marginLeft: -3 },
  date: { color: "#FFE3EB", marginBottom: 1, fontWeight: "500" },
  greeting: { color: "white", fontSize: 18, fontWeight: "bold", marginTop: 1 },
  incomeCard: { backgroundColor: "white", marginHorizontal: 20, borderRadius: 24, padding: 24, marginBottom: 20, shadowColor: "#4A1525", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  cardTitle: { fontSize: 13, color: "#8A6871", fontWeight: "600", marginBottom: 5 },
  amount: { fontSize: 30, fontWeight: "bold", color: "#4A1525", marginBottom: 5 },
  increase: { color: "#2D8A4E", fontSize: 12, fontWeight: "600" },
  warningRed: { backgroundColor: "#FFEAEA", marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  warningRedText: { color: "#CC3838", fontWeight: "700", fontSize: 14 },
  warningYellow: { backgroundColor: "#FFF3CD", marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  warningYellowText: { color: "#856404", fontWeight: "700", fontSize: 14 },
  warningContent: { flex: 1, marginLeft: 12 },
  warningIconRed: { fontSize: 20 },
  warningIconYellow: { fontSize: 20 },
  warningDetail: { fontSize: 13, color: "#665559", marginTop: 2 },

  // Stats Card Row
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, marginBottom: 20, gap: 12 },
  statsCard: { backgroundColor: "#FFF0F2", width: "48%", borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center" },
  statsIcon: { fontSize: 26, marginRight: 8 },
  statsContent: { flex: 1 },
  statsTitle: { fontSize: 11, fontWeight: "700", color: "#A84C63", marginBottom: 2 },
  statsNumber: { fontSize: 22, fontWeight: "bold", color: "#4A1525" },
  statsLabel: { color: "#8A6871", fontSize: 11, fontWeight: "500" },

  // Best Seller Card Style
  bestSellerCard: { backgroundColor: "white", marginHorizontal: 20, borderRadius: 24, padding: 22, marginBottom: 50, shadowColor: "#4A1525", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  bestSellerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  bestSellerTitle: { fontWeight: "bold", fontSize: 17, color: "#4A1525" },
  seeAll: { color: "#FF6B97", fontWeight: "700", fontSize: 13 },
  productRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#FFEBF0" },
  productName: { color: "#4A1525", fontWeight: "600", fontSize: 14 },
  productSold: { color: "#8A6871", fontWeight: "600", fontSize: 13 },
  emptyText: { textAlign: "center", color: "#A0AEC0", marginVertical: 15, fontSize: 13 },
});