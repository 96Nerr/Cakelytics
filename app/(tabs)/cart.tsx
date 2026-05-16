import { useTransactions } from "@/context/TransactionContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";

type Tab = "catat" | "rusak" | "riwayat";

let trxCounter = 0;

type TransactionItem = {
  productId: number;
  productName: string;
  qty: number;
  price: number;
  subtotal: number;
};

type Transaction = {
  id: number;
  trxCode: string;
  items: TransactionItem[];
  total: number;
  date: string;
  time?: string;
};

export default function PenjualanScreen() {
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [jumlah, setJumlah] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [expandedTrxId, setExpandedTrxId] = useState<
    number | string | null
  >(null);

  const { transactions, addTransaction } = useTransactions();

  const [cartItems, setCartItems] = useState<TransactionItem[]>([]);

  const tabs: { key: Tab; label: string; route: string }[] = [
    { key: "catat", label: "Catat Jual", route: "/cart" },
    {
      key: "rusak",
      label: "Rusak / Kadaluarsa",
      route: "/rusak-kadaluarsa",
    },
    { key: "riwayat", label: "Riwayat", route: "/riwayat" },
  ];

  const [products] = useState([
    { id: 1, name: "Brownies" },
    { id: 2, name: "Tiramisu" },
    { id: 3, name: "Cheesecake" },
    { id: 4, name: "Soft Cookies" },
    { id: 5, name: "Cheesecake Slice" },
  ]);

  const getFormattedDate = () => {
    const now = new Date();

    return `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()}`;
  };

  const getFormattedTime = () => {
    const now = new Date();

    return `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  };

  const getTodayHeader = () => {
    return getFormattedDate();
  };

  const formatRupiah = (amount: number) => {
    return (
      "Rp " +
      amount.toLocaleString("id-ID", {
        minimumFractionDigits: 0,
      })
    );
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !jumlah) return;

    const qty = Number(jumlah);

    const newItem: TransactionItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      qty,
      price: 5000,
      subtotal: qty * 5000,
    };

    setCartItems((prev) => [...prev, newItem]);

    setSelectedProduct(null);
    setJumlah("");
    setDropdownOpen(false);
    setModalVisible(false);
  };

  const handleSubmitSale = () => {
    if (cartItems.length === 0) return;

    trxCounter += 1;

    const total = cartItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    const newTransaction: Transaction = {
      id: Date.now(),
      trxCode: `TRX${String(trxCounter).padStart(2, "0")}`,
      items: cartItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        qty: item.qty,
        price: item.price,
        subtotal: item.subtotal,
      })),
      total,
      date: getFormattedDate(),
      time: getFormattedTime(),
    };

    addTransaction(newTransaction as any);

    setCartItems([]);
  };

  const toggleExpand = (id: number | string) => {
    setExpandedTrxId((prev) =>
      prev === id ? null : Number(id)
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#e65994"
      />

      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={["#e65994", "#ffffff"]}
          style={{ flex: 1 }}
        />
      </View>

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>
            Cak<Text style={styles.appTitleDot}>e</Text>lytics
          </Text>
        </View>

        {/* Section Title */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>PENJUALAN</Text>

          <Ionicons
            name="cart-outline"
            size={18}
            color="#ffffff"
            style={{ marginLeft: -2 }}
          />
        </View>

        {/* Tab */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                tab.key === "catat" && styles.tabItemActive,
              ]}
              onPress={() => {
                if (tab.key !== "catat") {
                  router.push(tab.route as any);
                }
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
                <Ionicons
                  name="cart-outline"
                  size={56}
                  color="#C7C7CC"
                />
              </View>

              <Text style={styles.emptyTitle}>
                Penjualan Masih Kosong
              </Text>

              <Text style={styles.emptySubtitle}>
                Tap tombol di bawah untuk menambahkan produk terjual
              </Text>
            </View>
          ) : (
            <View style={styles.txCard}>
              <View style={styles.txDateHeader}>
                <Text style={styles.txTodayLabel}>Today</Text>
                <Text style={styles.txTodayDate}>{getTodayHeader()}</Text>
              </View>

              {transactions.map((tx: any, index: number) => {
                const isExpanded = expandedTrxId === tx.id;
                const isFirst = index === 0;

                return (
                  <View key={tx.id}>
                    <TouchableOpacity
                      style={styles.txRow}
                      onPress={() => toggleExpand(tx.id)}
                      activeOpacity={0.6}
                    >
                      <View style={styles.txLeft}>
                        <View style={styles.txNameRow}>
                          <Text style={styles.txName}>
                            Transaksi {tx.trxCode}
                          </Text>

                          {isFirst && isExpanded && (
                            <View style={styles.txBadge}>
                              <Text style={styles.txBadgeText}>
                                {tx.items.reduce(
                                  (sum: number, item: any) => sum + item.qty,
                                  0
                                )}{" "}
                                pcs
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text style={styles.txDate}>{tx.date}</Text>

                        {isExpanded && (
                          <View style={styles.txExpandedDetail}>
                            {tx.items.map((item: any, i: number) => (
                              <View key={i} style={styles.txDetailRow}>
                                <Text style={styles.txDetailItem}>
                                  {item.productName} x {item.qty}
                                </Text>
                                <Text style={styles.txDetailPrice}>
                                  {formatRupiah(item.subtotal ?? 0)}
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
                              <Text style={[styles.txDetailItem, { fontWeight: "600" }]}>
                                Total
                              </Text>
                              <Text style={styles.txDetailPriceHighlight}>
                                {formatRupiah(tx.total)}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>

                      {!isExpanded && (
                        <Text style={styles.txTotal}>
                          {formatRupiah(tx.total)}
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
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>
              + Tambah Produk ke Penjualan
            </Text>
          </TouchableOpacity>

          {/* Checkout */}
          {cartItems.length > 0 && (
            <TouchableOpacity
              style={[styles.submitButton, { marginTop: 16 }]}
              onPress={handleSubmitSale}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                Checkout ({cartItems.length} Item)
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalCartIcon}>
              <Ionicons
                name="cart-outline"
                size={32}
                color="#C7C7CC"
              />
            </View>

            <Text style={styles.modalTitle}>Catat Produk Terjual</Text>
            <Text style={styles.modalSubtitle}>
              Catat penjualan di sini agar data pembukuan up-to-date.
            </Text>

            <Text style={styles.fieldLabel}>Pilih Produk</Text>
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
                {selectedProduct?.name || "-- Pilih Produk --"}
              </Text>
              <Ionicons
                name={dropdownOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color="#8E8E93"
              />
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdownList}>
                {products.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedProduct(item);
                      setDropdownOpen(false);
                    }}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.dropdownItemText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.fieldLabel}>Jumlah Produk</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Contoh : 0"
              placeholderTextColor="#C7C7CC"
              keyboardType="numeric"
              value={jumlah}
              onChangeText={setJumlah}
            />

            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.8}
              onPress={handleAddToCart}
            >
              <Text style={styles.submitButtonText}>
                Tambah Produk Terjual
              </Text>
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
    paddingTop: Platform.OS === "android" ? 44 : 20,
    paddingHorizontal: 24,
  },

  header: {
    marginBottom: 4,
  },

  appName: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.4,
    lineHeight: 34,
  },

  appTitleDot: {
    color: WHITE,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
    marginBottom: 20,
  },

  title: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  tabText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
    textAlign: "center",
  },

  tabTextActive: {
    color: "#e65994",
    fontWeight: "700",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: WHITE,
    borderRadius: 18,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#703e4b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },

  cartIllustration: {
    marginBottom: 12,
    opacity: 0.7,
  },

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

  addButton: {
    backgroundColor: PINK_BUTTON,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "88%",
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  modalCartIcon: {
    alignItems: "center",
    marginBottom: 8,
    opacity: 0.6,
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
    marginTop: 12,
  },

  dropdownField: {
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FAFAFC",
  },

  dropdownList: {
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginTop: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FAFAFC",
  },

  dropdownItemText: {
    fontSize: 14,
    color: "#2c2c2c",
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

  inputField: {
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#2c2c2c",
    backgroundColor: "#FAFAFC",
  },

  submitButton: {
    backgroundColor: RED_PRIMARY,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
    shadowColor: RED_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  submitButtonText: {
    color: WHITE,
    fontWeight: "700",
    fontSize: 15,
  },

  txCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#703e4b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },

  txDateHeader: {
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    paddingBottom: 8,
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

  txLeft: {
    flex: 1,
    paddingRight: 12,
  },

  txNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },

  txName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c2c2c",
  },

  txBadge: {
    backgroundColor: "#FF5C5C",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  txBadgeText: {
    fontSize: 10,
    color: WHITE,
    fontWeight: "700",
  },

  txDate: {
    fontSize: 11,
    color: "#8E8E93",
  },

  txTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E7D32",
  },

  txSeparator: {
    height: 1,
    backgroundColor: "#F2F2F7",
  },

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

  txDetailItem: {
    fontSize: 12,
    color: "#48484A",
    flex: 1,
  },

  txDetailPrice: {
    fontSize: 12,
    color: "#48484A",
    fontWeight: "600",
  },

  txDetailPriceHighlight: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "700",
  },
});