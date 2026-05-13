import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

const BASE_URL = "http://192.168.110.115:5000/api";

type Tab = "catat" | "rusak" | "riwayat";

// SESUAIKAN DENGAN SCHEMA PRISMA
type Transaction = {
  idTransaksi: number;
  tanggalTransaksi: string;
  totalPenjualan: number;
  detailPenjualan: {
    idDetail: number;
    jumlah: number;
    subtotal: number;
    produk: {
      namaProduk: string;
    };
  }[];
};

export default function PenjualanScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [jumlah, setJumlah] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedTrxId, setExpandedTrxId] = useState<number | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const tabs: { key: Tab; label: string; route: string }[] = [
    { key: "catat", label: "Catat Jual", route: "/cart" },
    { key: "rusak", label: "Rusak / Kadaluarsa", route: "/rusak-kadaluarsa" },
    { key: "riwayat", label: "Riwayat", route: "/riwayat" },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    await fetchProducts();
    await fetchTransactions();
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/produk`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Gagal ambil produk:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/transaksi`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Gagal ambil transaksi:", error);
    }
  };

  const handleSubmitSale = async () => {
    if (!selectedProduct || !jumlah) {
      Alert.alert("Warning", "Pilih produk dan isi jumlah!");
      return;
    }

    const qty = Number(jumlah);
    const totalHarga = selectedProduct.hargaJual * qty;

    try {
      const response = await fetch(`${BASE_URL}/transaksi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPenjualan: totalHarga,
          detailPesanan: [
            {
              idProduk: selectedProduct.idProduk,
              jumlah: qty,
              hargaModalSaatIni: selectedProduct.hargaModal,
              hargaJualSaatIni: selectedProduct.hargaJual,
              subtotal: totalHarga
            }
          ]
        }),
      });

      if (response.ok) {
        Alert.alert("Sukses", "Penjualan berhasil dicatat!");
        setModalVisible(false);
        setJumlah("");
        setSelectedProduct(null);
        fetchTransactions();
        fetchProducts();
      } else {
        Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan");
      }
    } catch (error) {
      Alert.alert("Error", "Koneksi terputus");
    }
  };

  const formatRupiah = (amount: number) => {
    return "Rp. " + (amount || 0).toLocaleString("id-ID");
  };

  const toggleExpand = (id: number) => {
    setExpandedTrxId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8848D" />
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={["#E8848D", "#FAD8DB"]} style={{ flex: 1 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Cakelitycs</Text>
        </View>

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>PENJUALAN</Text>
        </View>

        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, tab.key === "catat" && styles.tabItemActive]}
              onPress={() => tab.key !== "catat" && router.push(tab.route as any)}
            >
              <Text style={[styles.tabText, tab.key === "catat" && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {transactions.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyTitle}>Penjualan Masih Kosong</Text>
            </View>
          ) : (
            <View style={styles.txCard}>
              <View style={styles.txDateHeader}>
                <Text style={styles.txTodayLabel}>Riwayat Terakhir</Text>
              </View>

              {transactions.map((tx, index) => {
                const isExpanded = expandedTrxId === tx.idTransaksi;
                const firstDetail = tx.detailPenjualan?.[0];
                
                return (
                  <View key={tx.idTransaksi}>
                    <TouchableOpacity style={styles.txRow} onPress={() => toggleExpand(tx.idTransaksi)}>
                      <View style={styles.txLeft}>
                        <View style={styles.txNameRow}>
                          <Text style={styles.txName}>{firstDetail?.produk?.namaProduk || "Produk"}</Text>
                          {isExpanded && (
                             <View style={styles.txBadge}><Text style={styles.txBadgeText}>{firstDetail?.jumlah} pcs</Text></View>
                          )}
                        </View>
                        <Text style={styles.txDate}>{new Date(tx.tanggalTransaksi).toLocaleDateString("id-ID")}</Text>
                        
                        {isExpanded && (
                          <View style={styles.txExpandedDetail}>
                            {tx.detailPenjualan.map((item, i) => (
                              <View key={i} style={styles.txDetailRow}>
                                <Text style={styles.txDetailItem}>{item.produk?.namaProduk} x {item.jumlah}</Text>
                                <Text style={styles.txDetailPrice}>{formatRupiah(item.subtotal)}</Text>
                              </View>
                            ))}
                            <View style={{ marginTop: 5, borderTopWidth: 1, borderColor: '#eee', paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontWeight: 'bold' }}>TOTAL</Text>
                                <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>{formatRupiah(tx.totalPenjualan)}</Text>
                            </View>
                          </View>
                        )}
                      </View>
                      {!isExpanded && <Text style={styles.txTotal}>{formatRupiah(tx.totalPenjualan)}</Text>}
                    </TouchableOpacity>
                    {index < transactions.length - 1 && <View style={styles.txSeparator} />}
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+ Tambah Produk ke Penjualan</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Catat Terjual</Text>
            <Text style={styles.fieldLabel}>Pilih Produk</Text>
            <TouchableOpacity style={styles.dropdownField} onPress={() => setDropdownOpen(!dropdownOpen)}>
              <Text style={{ color: selectedProduct ? "#333" : "#bbb" }}>{selectedProduct?.namaProduk || "-- Pilih Produk --"}</Text>
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdownList}>
                {products.map((item) => (
                  <TouchableOpacity key={item.idProduk} style={styles.dropdownItem} onPress={() => { setSelectedProduct(item); setDropdownOpen(false); }}>
                    <Text>{item.namaProduk} (Stok: {item.stok})</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.fieldLabel}>Jumlah</Text>
            <TextInput style={styles.inputField} keyboardType="numeric" value={jumlah} onChangeText={setJumlah} placeholder="0" />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitSale}>
              <Text style={styles.submitButtonText}>Simpan</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const RED_PRIMARY = "#E05A6A";
const PINK_BUTTON = "#F2B4B8";
const WHITE = "#FFFFFF";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 12 : 8,
  },
  header: {
    marginBottom: 2,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2a2a2a",
    letterSpacing: 0.3,
  },
  appTitleDot: {
    color: RED_PRIMARY,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2a2a2a",
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 50,
    padding: 4,
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 50,
    alignItems: "center",
  },
  tabItemActive: {
    backgroundColor: WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  tabTextActive: {
    color: "#2a2a2a",
    fontWeight: "700",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // ── Empty State Card ──────────────────────────────────────────────
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#c06070",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 24,
  },
  cartIllustration: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2a2a2a",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    lineHeight: 19,
  },

  // ── Add Button ────────────────────────────────────────────────────
  addButton: {
    backgroundColor: PINK_BUTTON,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#c06070",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: RED_PRIMARY,
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Modal ─────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  modalCartIcon: {
    alignItems: "center",
    marginBottom: 12,
    opacity: 0.5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 20,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  dropdownField: {
    borderWidth: 1.5,
    borderColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fafafa",
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 16,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#333",
  },
  dropdownText: {
    fontSize: 14,
    color: "#bbb",
    flex: 1,
  },
  dropdownTextSelected: {
    color: "#333",
  },
  inputField: {
    borderWidth: 1.5,
    borderColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
    backgroundColor: "#fafafa",
  },
  submitButton: {
    backgroundColor: RED_PRIMARY,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: RED_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  submitButtonText: {
    color: WHITE,
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Transaction List Card ─────────────────────────────────────────
  txCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: "#c06070",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 24,
  },
  txDateHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  txTodayLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2a2a2a",
  },
  txTodayDate: {
    fontSize: 11,
    color: "#bbb",
    marginTop: 2,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  txLeft: {
    flex: 1,
    paddingRight: 12,
  },
  txNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  txName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2a2a2a",
  },
  txBadge: {
    backgroundColor: RED_PRIMARY,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  txBadgeText: {
    fontSize: 10,
    color: WHITE,
    fontWeight: "700",
  },
  txDate: {
    fontSize: 11,
    color: "#bbb",
    marginBottom: 2,
  },
  txTotal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4CAF50",
    marginTop: 2,
  },
  txSeparator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },

  // ── Expanded Detail ───────────────────────────────────────────────
  txExpandedDetail: {
    marginTop: 8,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  txDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txDetailItem: {
    fontSize: 11,
    color: "#888",
    flex: 1,
  },
  txDetailPrice: {
    fontSize: 11,
    color: "#888",
    fontWeight: "600",
  },
  txDetailPriceHighlight: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "700",
  },
});