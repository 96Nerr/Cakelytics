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
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

const BASE_URL = "http://192.168.1.21:5000/api";

type Tab = "catat" | "rusak" | "riwayat";

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
    { key: "rusak", label: "Rusak/Kadaluarsa", route: "/rusak-kadaluarsa" },
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
              subtotal: totalHarga,
            },
          ],
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
    return "Rp " + (amount || 0).toLocaleString("id-ID");
  };

  const toggleExpand = (id: number) => {
    setExpandedTrxId((prev) => (prev === id ? null : id));
  };

  const getTodayHeader = () => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  };

  

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#E8848D" />

      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={["#E8848D", "#FAD8DB"]} style={{ flex: 1 }} />
      </View>

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image
          source={require("../../assets/images/logo-cakelitycs.png")}
           style={styles.logo}  />                         
        </View>

        {/* Section Title */}
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>PENJUALAN</Text>
          <Ionicons name="cart-outline" size={28} color="#ffffff" />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                tab.key === "catat" && styles.tabItemActive,
              ]}
              onPress={() => {
                if (tab.key !== "catat") router.push(tab.route as any);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  tab.key === "catat" && styles.tabTextActive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {transactions.length === 0 ? (
            <View style={styles.card}>
              <View style={styles.cartIllustration}>
                <Ionicons name="cart-outline" size={56} color="#C7C7CC" />
              </View>
              <Text style={styles.emptyTitle}>Penjualan Masih Kosong</Text>
              <Text style={styles.emptySubtitle}>
                Tap tombol di bawah untuk menambahkan produk terjual
              </Text>
            </View>
          ) : (
            <View style={styles.txCard}>
              <View style={styles.txDateHeader}>
                <Text style={styles.txTodayLabel}>Riwayat Terakhir</Text>
                <Text style={styles.txTodayDate}>{getTodayHeader()}</Text>
              </View>

              {transactions.map((tx, index) => {
                const isExpanded = expandedTrxId === tx.idTransaksi;
                const firstDetail = tx.detailPenjualan?.[0];

                return (
                  <View key={tx.idTransaksi}>
                    <TouchableOpacity
                      style={styles.txRow}
                      onPress={() => toggleExpand(tx.idTransaksi)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.txLeft}>
                        <View style={styles.txNameRow}>
                          <Text style={styles.txName}>
                            {firstDetail?.produk?.namaProduk || "Produk"}
                          </Text>
                          {isExpanded && (
                            <View style={styles.txBadge}>
                              <Text style={styles.txBadgeText}>
                                {firstDetail?.jumlah} pcs
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.txDate}>
                          {new Date(tx.tanggalTransaksi).toLocaleDateString(
                            "id-ID"
                          )}
                        </Text>

                        {isExpanded && (
                          <View style={styles.txExpandedDetail}>
                            {tx.detailPenjualan.map((item, i) => (
                              <View key={i} style={styles.txDetailRow}>
                                <Text style={styles.txDetailItem}>
                                  {item.produk?.namaProduk} x {item.jumlah}
                                </Text>
                                <Text style={styles.txDetailPrice}>
                                  {formatRupiah(item.subtotal)}
                                </Text>
                              </View>
                            ))}
                            <View
                              style={[
                                styles.txDetailRow,
                                {
                                  marginTop: 8,
                                  borderTopWidth: 1,
                                  borderTopColor: "#E5E5EA",
                                  paddingTop: 6,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.txDetailItem,
                                  { fontWeight: "600" },
                                ]}
                              >
                                TOTAL
                              </Text>
                              <Text style={styles.txDetailPriceHighlight}>
                                {formatRupiah(tx.totalPenjualan)}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>

                      {!isExpanded && (
                        <Text style={styles.txTotal}>
                          {formatRupiah(tx.totalPenjualan)}
                        </Text>
                      )}
                    </TouchableOpacity>

                    {index < transactions.length - 1 && (
                      <View style={styles.txSeparator} />
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Add Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color="#b03d4c"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.addButtonText}>Tambah Produk ke Penjualan</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── MODAL — Catat Penjualan ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setDropdownOpen(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setModalVisible(false);
              setDropdownOpen(false);
            }}
          />

          <View style={styles.modalCard}>
            {/* Icon */}
            <View style={styles.modalCartIcon}>
              <Ionicons name="cart-outline" size={28} color="#E8848D" />
            </View>

            <Text style={styles.modalTitle}>Catat Produk Terjual</Text>
            <Text style={styles.modalSubtitle}>
              Catat penjualan agar data pembukuan selalu up-to-date.
            </Text>

            {/* Dropdown Produk */}
            <Text style={styles.fieldLabel}>Pilih Produk</Text>
            <View style={{ zIndex: 5000 }}>
              <TouchableOpacity
                style={styles.dropdownField}
                onPress={() => setDropdownOpen(!dropdownOpen)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    selectedProduct && styles.dropdownTextSelected,
                  ]}
                >
                  {selectedProduct?.namaProduk || "-- Pilih Produk --"}
                </Text>
                <Ionicons
                  name={dropdownOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#8E8E93"
                />
              </TouchableOpacity>

              {dropdownOpen && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    style={{ maxHeight: 150 }}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="always"
                    contentContainerStyle={{ flexGrow: 1 }}
                  >
                    {products.map((item) => (
                      <TouchableOpacity
                        key={item.idProduk}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedProduct(item);
                          setDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          {item.namaProduk}{" "}
                          <Text style={{ color: "#8E8E93", fontSize: 12 }}>
                            (Stok: {item.stok})
                          </Text>
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Input Jumlah */}
            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
              Jumlah Produk
            </Text>
            <TextInput
              style={styles.inputField}
              keyboardType="numeric"
              value={jumlah}
              onChangeText={setJumlah}
              placeholder="Contoh: 1"
              placeholderTextColor="#C7C7CC"
            />

            {/* Info Harga */}
            {selectedProduct && jumlah ? (
              <View style={styles.pricePreview}>
                <Text style={styles.pricePreviewLabel}>Total</Text>
                <Text style={styles.pricePreviewValue}>
                  {formatRupiah(selectedProduct.hargaJual * Number(jumlah))}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitSale}
              activeOpacity={0.85}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.submitButtonText}>Simpan Penjualan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
const RED_PRIMARY = "#E05A6A";
const PINK_BUTTON = "#F2B4B8";
const WHITE = "#FFFFFF";

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 12 : 8,
  },

  header: { marginBottom: 14 },

  appName: {
    color: WHITE,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  appTitleAccent: { color: "rgba(255,255,255,0.7)" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },

  sectionTitle: {
    color: WHITE,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 50,
    padding: 4,
    marginBottom: 20,
  },

  tabItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 50,
    alignItems: "center",
  },

  tabItemActive: {
    backgroundColor: WHITE,
    shadowColor: "#703e4b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  tabText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
    textAlign: "center",
  },

  tabTextActive: {
    color: RED_PRIMARY,
    fontWeight: "700",
  },

  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  // ── Empty card ──
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 44,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#703e4b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  cartIllustration: { marginBottom: 14, opacity: 0.7 },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2c2c2c",
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 18,
  },

  // ── Add button ──
  addButton: {
    backgroundColor: PINK_BUTTON,
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#e08897",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  addButtonText: {
    color: "#b03d4c",
    fontWeight: "700",
    fontSize: 14,
  },

  // ── Transaction card ──
  txCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#703e4b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  txDateHeader: {
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    paddingBottom: 10,
    marginBottom: 8,
  },

  txTodayLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1c1c1e",
  },

  txTodayDate: {
    fontSize: 11,
    color: "#8E8E93",
    marginTop: 1,
  },

  txRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },

  txLeft: { flex: 1, paddingRight: 12 },

  txNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },

  txName: { fontSize: 14, fontWeight: "600", color: "#2c2c2c" },

  txBadge: {
    backgroundColor: RED_PRIMARY,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  txBadgeText: { fontSize: 10, color: WHITE, fontWeight: "700" },

  txDate: { fontSize: 11, color: "#8E8E93" },

  txTotal: { fontSize: 14, fontWeight: "700", color: "#2E7D32" },

  txSeparator: { height: 1, backgroundColor: "#F2F2F7" },

  txExpandedDetail: {
    marginTop: 10,
    backgroundColor: "#FAFAFC",
    borderRadius: 12,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },

  txDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  txDetailItem: { fontSize: 12, color: "#48484A", flex: 1 },

  txDetailPrice: { fontSize: 12, color: "#48484A", fontWeight: "600" },

  txDetailPriceHighlight: { fontSize: 13, color: "#2E7D32", fontWeight: "700" },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  modalCartIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FFF0F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontWeight: "800",
    fontSize: 18,
    color: "#1c1c1e",
    marginBottom: 4,
  },

  modalSubtitle: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 16,
    lineHeight: 18,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#48484A",
    marginBottom: 6,
  },

  dropdownField: {
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FAFAFC",
  },

  dropdownText: {
    fontSize: 14,
    color: "#C7C7CC",
    flex: 1,
  },

  dropdownTextSelected: {
    color: "#2c2c2c",
    fontWeight: "500",
  },

  dropdownList: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    backgroundColor: WHITE,
    elevation: 10,
    zIndex: 10000,
    maxHeight: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },

  dropdownItem: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#FAFAFC",
  },

  dropdownItemText: {
    fontSize: 14,
    color: "#2c2c2c",
  },

  inputField: {
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2c2c2c",
    backgroundColor: "#FAFAFC",
  },

  pricePreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF0F1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },

  pricePreviewLabel: {
    fontSize: 13,
    color: RED_PRIMARY,
    fontWeight: "600",
  },

  pricePreviewValue: {
    fontSize: 15,
    color: RED_PRIMARY,
    fontWeight: "800",
  },

  submitButton: {
    backgroundColor: RED_PRIMARY,
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: RED_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  logo: {
  width: 180,
  height: 55,
  resizeMode: "contain",
},
  submitButtonText: { color: WHITE, fontWeight: "700", fontSize: 15 },
});
