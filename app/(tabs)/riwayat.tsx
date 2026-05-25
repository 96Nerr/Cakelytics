import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image } from "react-native";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native"; // ✅ PENTING: Supaya data ke-refresh pas pindah tab

const BASE_URL = "http://192.168.254.103:5000/api";

// KONSISTENSI WARNA TEMA (Strawberry Soft-Cake Premium)
const PINK_DARK = "#FF6B97";
const PINK_LIGHT = "#FFF5F7";
const WHITE = "#FFFFFF";
const DARK_TEXT = "#4A1525";
const MUTED_TEXT = "#8A6871";
const GREEN_PRICE = "#2E9E5B";

type DetailPenjualan = {
  idDetail: number;
  idProduk: number; // ✅ FIX: Menggunakan P besar sesuai struktur database asli
  jumlah: number;
  subtotal: number;
  produk?: {
    namaProduk: string;
  };
  Produk?: {
    namaProduk: string;
  };
};

type Transaction = {
  idTransaksi: number;
  tanggalTransaksi: string;
  totalPenjualan: number;
  detailPenjualan: DetailPenjualan[];
};

function formatRupiah(amount: number): string {
  return "Rp. " + (amount || 0).toLocaleString("id-ID");
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${m} ${ampm}`;
}

export default function RiwayatScreen() {
  const router = useRouter();
  const isFocused = useIsFocused(); // ✅ Deteksi kalau user lagi buka tab riwayat
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  // ✅ Auto refresh data riwayat setiap kali lo habis checkout dari tab "Catat Jual"
  useEffect(() => {
    if (isFocused) {
      fetchTransactions();
    }
  }, [isFocused]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/transaksi`);
      const data = await response.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal ambil transaksi:", error);
    }
  };

  const totalQty = (trx: Transaction) =>
    trx.detailPenjualan?.reduce((s, i) => s + i.jumlah, 0) ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={PINK_DARK} />

      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={[PINK_DARK, PINK_LIGHT]} style={{ flex: 1 }} />
      </View>
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Image
            source={require("../../assets/images/logo-cakelitycs.png")}
            style={styles.logo}  
          />                        
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>PENJUALAN</Text>
          <Ionicons name="cart-outline" size={24} color="#ffffff" style={{ marginLeft: 6 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push("/cart")}
            activeOpacity={0.8}
          >
            <Text style={styles.tabText}>Catat Jual</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push("/rusak-kadaluarsa")}
            activeOpacity={0.8}
          >
            <Text style={styles.tabText}>Rusak/Kadaluarsa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, styles.tabActive]} activeOpacity={0.8}>
            <Text style={[styles.tabText, styles.tabTextActive]}>Riwayat</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.mainCard}>
            <Text style={styles.cardTitle}>Daftar Riwayat Penjualan</Text>

            {transactions.length === 0 ? (
              <View style={styles.emptyArea}>
                <Ionicons name="receipt-outline" size={44} color="#B0A0A5" />
                <Text style={styles.emptyText}>Belum ada riwayat transaksi penjualan.</Text>
              </View>
            ) : (
              <View style={styles.itemList}>
                {transactions.map((trx) => (
                  <TouchableOpacity
                    key={trx.idTransaksi}
                    style={styles.itemRowContainer}
                    onPress={() => setSelectedTrx(trx)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.trxLeft}>
                      <Text style={styles.trxCode}>TRX-{trx.idTransaksi}</Text>
                      <Text style={styles.trxDate}>{formatDate(trx.tanggalTransaksi)}</Text>
                    </View>
                    <Text style={styles.trxPrice}>{formatRupiah(trx.totalPenjualan)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Detail Modal */}
      <Modal
        visible={!!selectedTrx}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTrx(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setSelectedTrx(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {selectedTrx && (
              <>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTrxCode}>TRX-{selectedTrx.idTransaksi}</Text>
                    <Text style={styles.modalDate}>
                      {formatDate(selectedTrx.tanggalTransaksi)} - {formatTime(selectedTrx.tanggalTransaksi)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setSelectedTrx(null)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={14} color={WHITE} />
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* Items */}
                <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                  {Array.isArray(selectedTrx.detailPenjualan) && selectedTrx.detailPenjualan.length > 0 ? (
                    selectedTrx.detailPenjualan.map((item, idx) => {
                      // ✅ Membaca namaProduk dari relasi "produk" atau "Produk" secara dinamis dan aman
                      const namaKue = item.produk?.namaProduk || item.Produk?.namaProduk || `Produk ID #${item.idProduk || (item as any).idproduk}`;
                      
                      return (
                        <View key={idx} style={styles.itemDetailRow}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {namaKue} <Text style={{ color: MUTED_TEXT, fontWeight: "400" }}>x {item.jumlah}</Text>
                          </Text>
                          <Text style={styles.itemPrice}>{formatRupiah(item.subtotal)}</Text>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.fallbackText}>Detail kue tidak termuat</Text>
                  )}
                </ScrollView>

                <View style={styles.divider} />

                {/* Footer */}
                <View style={styles.modalFooter}>
                  <Text style={styles.pcsText}>{totalQty(selectedTrx)} pcs</Text>
                  <Text style={styles.totalPrice}>{formatRupiah(selectedTrx.totalPenjualan)}</Text>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: { marginBottom: 2, alignItems: "flex-start" },
  logo: {
    width: 120,
    height: 35,
    resizeMode: "contain",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: WHITE,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 50,
    padding: 4,
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: WHITE,
    elevation: 3,
    shadowColor: "#4A1525",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: { fontSize: 12, color: "#FFE3EB", fontWeight: "600", textAlign: "center" },
  tabTextActive: { color: DARK_TEXT, fontWeight: "700" },
  scrollContent: { paddingBottom: 40 },
  mainCard: { 
    backgroundColor: WHITE, 
    borderRadius: 24, 
    padding: 20, 
    elevation: 3, 
    shadowColor: "#4A1525", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10 
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: DARK_TEXT, marginBottom: 16 },
  emptyArea: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 13, color: MUTED_TEXT, textAlign: "center", fontWeight: "500" },
  itemList: { marginBottom: 4 },
  itemRowContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    backgroundColor: "#FFF5F7", 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: "#FFEBF0" 
  },
  trxLeft: {},
  trxCode: { fontSize: 14, fontWeight: "700", color: DARK_TEXT },
  trxDate: { fontSize: 12, color: MUTED_TEXT, marginTop: 2, fontWeight: "500" },
  trxPrice: { fontSize: 14, fontWeight: "700", color: GREEN_PRICE },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(74, 21, 37, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 20,
    width: "100%",
    maxWidth: 380,
    shadowColor: "#4A1525",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  modalTrxCode: { fontSize: 16, fontWeight: "800", color: DARK_TEXT },
  modalDate: { fontSize: 12, color: MUTED_TEXT, marginTop: 4, fontWeight: "500" },
  closeBtn: {
    backgroundColor: "#E05A6A",
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: "#FFEBF0", marginVertical: 14 },
  itemDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itemName: { fontSize: 13, color: DARK_TEXT, fontWeight: "600", flex: 1, marginRight: 8 },
  itemPrice: { fontSize: 13, color: DARK_TEXT, fontWeight: "700" },
  fallbackText: { fontSize: 12, color: MUTED_TEXT, textAlign: "center", marginVertical: 8 },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pcsText: { fontSize: 13, color: MUTED_TEXT, fontWeight: "500" },
  totalPrice: { fontSize: 16, fontWeight: "800", color: GREEN_PRICE },
});