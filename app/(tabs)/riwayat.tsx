import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image } from "react-native";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "http://192.168.1.14:5000/api";

const PINK_DARK = "#E8848D";
const PINK_LIGHT = "#FAD8DB";
const RED_PRIMARY = "#E05A6A";
const WHITE = "#FFFFFF";
const GREEN_PRICE = "#2E9E5B";

type DetailPenjualan = {
  idDetail: number;
  jumlah: number;
  subtotal: number;
  produk: {
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/transaksi`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Gagal ambil transaksi:", error);
    }
  };

  const totalQty = (trx: Transaction) =>
    trx.detailPenjualan?.reduce((s, i) => s + i.jumlah, 0) ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#E8848D" />

  <View style={StyleSheet.absoluteFillObject}>
    <LinearGradient
      colors={["#E8848D", "#FAD8DB"]}
      style={{ flex: 1 }}
    />
  </View>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
                  <Image
                  source={require("../../assets/images/logo-cakelitycs.png")}
                   style={styles.logo}  />                         
                </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>PENJUALAN</Text>
          <Ionicons name="cart-outline" size={28} color="#ffffff" style={{ marginLeft: 6 }} />
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
            <Text style={styles.tabText}>Rusak / Kadaluarsa</Text>
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
          {transactions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>Belum Ada Transaksi</Text>
              <Text style={styles.emptySubtitle}>Riwayat penjualan akan muncul di sini</Text>
            </View>
          ) : (
            transactions.map((trx) => (
              <TouchableOpacity
                key={trx.idTransaksi}
                style={styles.trxCard}
                onPress={() => setSelectedTrx(trx)}
                activeOpacity={0.82}
              >
                <View style={styles.trxLeft}>
                  <Text style={styles.trxCode}>TRX{trx.idTransaksi}</Text>
                  <Text style={styles.trxDate}>{formatDate(trx.tanggalTransaksi)}</Text>
                </View>
                <Text style={styles.trxPrice}>{formatRupiah(trx.totalPenjualan)}</Text>
              </TouchableOpacity>
            ))
          )}
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
                    <Text style={styles.modalTrxCode}>TRX{selectedTrx.idTransaksi}</Text>
                    <Text style={styles.modalDate}>{formatDate(selectedTrx.tanggalTransaksi)}</Text>
                    <Text style={styles.modalTime}>{formatTime(selectedTrx.tanggalTransaksi)}</Text>
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
                {selectedTrx.detailPenjualan?.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemName}>
                      {item.produk?.namaProduk} x {item.jumlah}
                    </Text>
                    <Text style={styles.itemPrice}>{formatRupiah(item.subtotal)}</Text>
                  </View>
                ))}

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
  safeArea: { flex: 1, backgroundColor: PINK_DARK },
  bgTop: { ...StyleSheet.absoluteFillObject, backgroundColor: PINK_DARK },
  bgBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: PINK_LIGHT,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 12 : 8,
  },
  appTitle: { fontSize: 22, fontWeight: "800", color: "#2a2a2a" },
  appTitleAccent: { color: RED_PRIMARY },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1.2,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 50,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 50,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: { fontSize: 11, color: "#666", fontWeight: "500", textAlign: "center" },
  tabTextActive: { color: "#2a2a2a", fontWeight: "700" },
  scrollContent: { paddingBottom: 24 },
  emptyCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 44,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#c06070",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2c2c2c",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
  },
  trxCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#c06070",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  trxLeft: {},
  trxCode: { fontSize: 13, fontWeight: "700", color: "#2a2a2a" },
  trxDate: { fontSize: 11, color: "#aaa", marginTop: 2 },
  trxPrice: { fontSize: 13, fontWeight: "700", color: GREEN_PRICE },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  modalTrxCode: { fontSize: 16, fontWeight: "800", color: "#1a1a1a" },
  modalDate: { fontSize: 12, color: "#888", marginTop: 2 },
  modalTime: { fontSize: 12, color: "#aaa" },
  closeBtn: {
    backgroundColor: RED_PRIMARY,
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 12 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: { fontSize: 13, color: "#333", fontWeight: "500" },
  itemPrice: { fontSize: 13, color: "#333", fontWeight: "600" },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },

  header: { marginBottom: 14 },

   logo: {
  width: 180,
  height: 55,
  resizeMode: "contain",
},
  pcsText: { fontSize: 13, color: "#aaa" },
  totalPrice: { fontSize: 15, fontWeight: "800", color: GREEN_PRICE },
});
