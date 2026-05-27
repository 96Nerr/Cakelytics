import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart, PieChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const screenWidth = Dimensions.get("window").width;
const BASE_URL = "http://192.168.254.103:5000/api";

// background utama
const PINK_PRIMARY = "#FF6B97";
const PINK_LIGHT = "#FFF5F7";
const DARK_TEXT = "#4A1525";
const MUTED_TEXT = "#8A6871";
const WHITE = "#FFFFFF";

export default function Laporan() {
  const [selectedTab, setSelectedTab] = useState("7hari");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ pendapatan: 0, keuntungan: 0 });
  const [chartData, setChartData] = useState<any>(null);
  const [pieData, setPieData] = useState<any[]>([]);
  const [produkTerlaris, setProdukTerlaris] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchLaporan();
    }, [selectedTab])
  );

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/transaksi`);
      const data: any[] = await response.json();
      processData(data);
    } catch (error) {
      console.log("ERROR FETCH DATA LAPORAN:", error);
    } finally {
      setLoading(false);
    }
  };

  const processData = (data: any[]) => {
    let totalPendapatan = 0;
    let totalKeuntungan = 0;
    const produkMap: any = {};

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let labels: string[] = [];
    let grafikPendapatan: number[] = [];

    if (selectedTab === "7hari") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        labels.push(`${d.toLocaleDateString("id-ID", { weekday: "short" })} ${d.getDate()}`);
        grafikPendapatan.push(0);
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labels.push(d.toLocaleDateString("id-ID", { month: "short" }));
        grafikPendapatan.push(0);
      }
    }

    data.forEach((trx: any) => {
      const trxDate = new Date(trx.tanggalTransaksi);
      const trxDayOnly = new Date(trxDate.getFullYear(), trxDate.getMonth(), trxDate.getDate());

      if (selectedTab === "7hari") {
        const diffTime = today.getTime() - trxDayOnly.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays < 7) {
          const dayIndex = 6 - diffDays;
          grafikPendapatan[dayIndex] += trx.totalPenjualan || 0;
          
          totalPendapatan += trx.totalPenjualan || 0;
          trx.detailPenjualan?.forEach((item: any) => {
            const qty = item?.jumlah || 0;
            const hargaJual = item?.hargaJualSaatIni || 0;
            const hargaModal = item?.hargaModalSaatIni || 0;
            totalKeuntungan += (hargaJual - hargaModal) * qty;
          });
        }
      } 
      else {
        const diffMonths = (today.getFullYear() - trxDate.getFullYear()) * 12 + (today.getMonth() - trxDate.getMonth());

        if (diffMonths >= 0 && diffMonths < 6) {
          const monthIndex = 5 - diffMonths;
          grafikPendapatan[monthIndex] += trx.totalPenjualan || 0;

          totalPendapatan += trx.totalPenjualan || 0;
          trx.detailPenjualan?.forEach((item: any) => {
            const qty = item?.jumlah || 0;
            const hargaJual = item?.hargaJualSaatIni || 0;
            const hargaModal = item?.hargaModalSaatIni || 0;
            totalKeuntungan += (hargaJual - hargaModal) * qty;
          });
        }
      }

      const diffTimeCheck = today.getTime() - trxDayOnly.getTime();
      const diffDaysCheck = Math.floor(diffTimeCheck / (1000 * 60 * 60 * 24));
      const diffMonthsCheck = (today.getFullYear() - trxDate.getFullYear()) * 12 + (today.getMonth() - trxDate.getMonth());
      
      const isWithinFilter = selectedTab === "7hari" 
        ? (diffDaysCheck >= 0 && diffDaysCheck < 7)
        : (diffMonthsCheck >= 0 && diffMonthsCheck < 6);

      if (isWithinFilter) {
        trx.detailPenjualan?.forEach((item: any) => {
          const nama = item?.produk?.namaProduk || "Produk Tidak Diketahui";
          if (!produkMap[nama]) {
            produkMap[nama] = { nama, qty: 0, total: 0 };
          }
          produkMap[nama].qty += item?.jumlah || 0;
          produkMap[nama].total += item?.subtotal || 0;
        });
      }
    });

    setSummary({ pendapatan: totalPendapatan, keuntungan: totalKeuntungan });
    setChartData({ labels, datasets: [{ data: grafikPendapatan }] });

    const sortedProduk = Object.values(produkMap)
      .sort((a: any, b: any) => b.qty - a.qty)
      .slice(0, 3);

    const totalQty = sortedProduk.reduce<number>((a, b: any) => a + b.qty, 0);
    const colors = [PINK_PRIMARY, "#FFB830", "#6C5CE7"];
    
    setPieData(
      totalQty > 0
        ? sortedProduk.map((item: any, idx: number) => ({
            name: item.nama.length > 12 ? item.nama.substring(0, 10) + "..." : item.nama,
            population: Math.round((item.qty / totalQty) * 100),
            color: colors[idx] || "#999",
            legendFontColor: DARK_TEXT,
            legendFontSize: 11,
          }))
        : []
    );
    setProdukTerlaris(sortedProduk);
  };

  const formatRupiah = (number: number) => "Rp " + number.toLocaleString("id-ID");

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PINK_PRIMARY} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER GRADIENT CARD */}
        <LinearGradient
          colors={["#FF6B97", "#FF8DAF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradientCard}
        >
          <Image 
            source={require("../../assets/images/logo-cakelitycs.png")} 
            style={styles.logoImageWhite} 
            resizeMode="contain"
          />
          {/* 1. title header */}
          <Text style={styles.titleSubWhite}>Business Analytics & Performance Insights — We're Cooking! 🔥</Text>
          
          {/* 2. badge realtime */}
          <View style={styles.headerBadge}>
            <Text style={styles.badgeText}>Automated Database Sync</Text>
          </View>
        </LinearGradient>

        {/* controller tab filter*/}
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, selectedTab === "7hari" && styles.activeButton]} 
            onPress={() => setSelectedTab("7hari")}
          >
            <Text style={[styles.filterText, selectedTab === "7hari" && styles.activeText]}>7 Hari Terakhir</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, selectedTab === "6bulan" && styles.activeButton]} 
            onPress={() => setSelectedTab("6bulan")}
          >
            <Text style={[styles.filterText, selectedTab === "6bulan" && styles.activeText]}>6 Bulan Terakhir</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 6 }} />
        <View style={styles.cardRow}>
          <View style={styles.smallCardCentered}>
            <View style={styles.iconYellow}><Text style={styles.moneyText}>Rp</Text></View>
            <Text style={styles.cardLabel}>Pendapatan</Text>
            <Text style={styles.cardValue}>{formatRupiah(summary.pendapatan)}</Text>
          </View>
          <View style={styles.smallCardCentered}>
            <View style={styles.iconGreen}><Ionicons name="trending-up" size={15} color="#2E9E5B" /></View>
            <Text style={styles.cardLabel}>Laba Bersih</Text>
            <Text style={styles.cardValue}>{formatRupiah(summary.keuntungan)}</Text>
          </View>
        </View>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Grafik Omzet Penjualan</Text>
          {chartData && chartData.datasets[0].data.reduce((a: number, b: number) => a + b, 0) > 0 ? (
            <BarChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              fromZero={true}
              showValuesOnTopOfBars={true}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{ backgroundColor: WHITE, backgroundGradientFrom: WHITE, backgroundGradientTo: WHITE, decimalPlaces: 0, color: (opacity = 1) => `rgba(255, 107, 151, ${opacity})`, labelColor: () => DARK_TEXT, barPercentage: 0.55, propsForLabels: { fontSize: 9, fontWeight: "600" } }}
              style={{ marginTop: 15, borderRadius: 16, marginLeft: -15 }}
            />
          ) : (
            <Text style={styles.emptyText}>Tidak ada data omzet pada periode ini</Text>
          )}
        </View>
        {/* PIE CHART PRODUK TERLARIS */}
        <View style={styles.bestSellerCard}>
          <Text style={styles.bestSellerTitle}>Proporsi Kue Terlaris</Text>
          <View style={styles.pieRow}>
            {pieData.length > 0 ? (
              <PieChart
                data={pieData}
                width={screenWidth - 60}
                height={160}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                center={[0, 0]}
                hasLegend={true}
                chartConfig={{
                  color: () => DARK_TEXT,
                }}
              />
            ) : (
              <Text style={styles.emptyText}>Tidak ada transaksi dalam periode ini</Text>
            )}
          </View>

          {/* LIST DARI DATABASE */}
          {produkTerlaris.map((item: any, index: number) => (
            <View 
              key={index} 
              style={[
                styles.productCard, 
                { backgroundColor: index === 0 ? "#FFF0F3" : "#F9F9F9", borderWidth: 1, borderColor: index === 0 ? "#FFDEE5" : "#EFEFEF" }
              ]}
            >
              <View style={styles.productLeft}>
                <View style={[styles.productIcon, { backgroundColor: index === 0 ? "#FFF3B0" : index === 1 ? "#E3F2FD" : "#F3E5F5" }]}>
                  <Ionicons name="medal" size={18} color={index === 0 ? "#FFA000" : index === 1 ? "#1E88E5" : "#8E24AA"} />
                </View>
                <View style={styles.productTextContainer}>
                  <Text style={styles.productName} numberOfLines={1}>{item.nama}</Text>
                  <Text style={styles.productIncome}>Total: {formatRupiah(item.total)}</Text>
                </View>
              </View>
              <View style={styles.productRight}>
                <Text style={styles.productQty}>{item.qty}</Text>
                <Text style={styles.productSold}>Terjual</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: PINK_LIGHT },
  container: { flex: 1, backgroundColor: PINK_LIGHT },
  headerGradientCard: { marginHorizontal: 16, marginTop: 15, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 20, shadowColor: "#4A1525", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  logoImageWhite: { width: 140, height: 38, marginLeft: -4, marginBottom: 2 },
  titleSubWhite: { color: "#FFF0F3", fontSize: 11, fontWeight: "600", opacity: 0.95, letterSpacing: 0.2 },
  headerBadge: { backgroundColor: "rgba(255, 255, 255, 0.2)", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 8 },
  badgeText: { color: WHITE, fontSize: 9, fontWeight: "600" },
  filterContainer: { flexDirection: "row", backgroundColor: "rgba(255, 107, 151, 0.15)", marginHorizontal: 20, marginVertical: 12, borderRadius: 16, padding: 4 },
  filterButton: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  activeButton: { backgroundColor: WHITE, shadowColor: DARK_TEXT, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  filterText: { color: MUTED_TEXT, fontSize: 13, fontWeight: "700" },
  activeText: { color: PINK_PRIMARY, fontWeight: "800" },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, marginTop: 4 },
  smallCardCentered: { backgroundColor: WHITE, width: "48%", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#FFEBF0", alignItems: "center", justifyContent: "center", shadowColor: DARK_TEXT, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  iconYellow: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#FFF3B0", justifyContent: "center", alignItems: "center", marginBottom: 6 },
  iconGreen: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#EAF7EE", justifyContent: "center", alignItems: "center", marginBottom: 6 },
  moneyText: { fontWeight: "800", fontSize: 12, color: "#FFA000" },
  cardLabel: { color: MUTED_TEXT, fontSize: 11, fontWeight: "600", textAlign: "center" },
  cardValue: { fontWeight: "800", fontSize: 13, marginTop: 3, color: DARK_TEXT, textAlign: "center" },
  chartCard: { backgroundColor: WHITE, marginHorizontal: 20, marginTop: 16, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: "#FFEBF0", shadowColor: DARK_TEXT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  chartTitle: { fontWeight: "800", fontSize: 15, color: DARK_TEXT },
  bestSellerCard: { backgroundColor: WHITE, marginHorizontal: 20, marginTop: 16, marginBottom: 40, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: "#FFEBF0", shadowColor: DARK_TEXT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  bestSellerTitle: { fontWeight: "800", fontSize: 15, color: DARK_TEXT },
  pieRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 4 },
  emptyText: { textAlign: "center", color: MUTED_TEXT, marginVertical: 20, fontWeight: "500", fontSize: 13, width: "100%" },
  productCard: { marginTop: 10, borderRadius: 16, padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  productLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 },
  productIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  productTextContainer: { flex: 1 },
  productName: { fontWeight: "700", fontSize: 13, color: DARK_TEXT },
  productIncome: { color: MUTED_TEXT, fontSize: 11, marginTop: 1, fontWeight: "500" },
  productRight: { alignItems: "center", minWidth: 45 },
  productQty: { fontWeight: "900", fontSize: 20, color: DARK_TEXT },
  productSold: { color: MUTED_TEXT, fontSize: 10, fontWeight: "600" },
});