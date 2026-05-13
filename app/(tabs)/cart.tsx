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
      "Rp. " +
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
        barStyle="dark-content"
        backgroundColor="#E8848D"
      />

      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={["#E8848D", "#FAD8DB"]}
          style={{ flex: 1 }}
        />
      </View>

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>
            Cak<Text style={styles.appTitleDot}>e</Text>litycs
          </Text>
        </View>

        {/* Section Title */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>PENJUALAN</Text>

          <Ionicons
            name="cart-outline"
            size={20}
            color="#333"
            style={{ marginLeft: 6 }}
          />
        </View>

        {/* Tab */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                tab.key === "catat" &&
                  styles.tabItemActive,
              ]}
              onPress={() => {
                if (tab.key !== "catat") {
                  router.push(tab.route as any);
                }
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  tab.key === "catat" &&
                    styles.tabTextActive,
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
                  size={64}
                  color="#ccc"
                />
              </View>

              <Text style={styles.emptyTitle}>
                Penjualan Masih Kosong
              </Text>

              <Text style={styles.emptySubtitle}>
                Tap tombol dibawah untuk menambahkan
                produk terjual
              </Text>
            </View>
          ) : (
            <View style={styles.txCard}>
              <View style={styles.txDateHeader}>
                <Text style={styles.txTodayLabel}>
                  Today
                </Text>

                <Text style={styles.txTodayDate}>
                  {getTodayHeader()}
                </Text>
              </View>

              {transactions.map((tx: any, index: number) => {
                const isExpanded =
                  expandedTrxId === tx.id;

                const isFirst = index === 0;

                return (
                  <View key={tx.id}>
                    <TouchableOpacity
                      style={styles.txRow}
                      onPress={() =>
                        toggleExpand(tx.id)
                      }
                      activeOpacity={0.7}
                    >
                      <View style={styles.txLeft}>
                        <View
                          style={styles.txNameRow}
                        >
                          <Text style={styles.txName}>
                            Transaksi {tx.trxCode}
                          </Text>

                          {isFirst &&
                            isExpanded && (
                              <View
                                style={styles.txBadge}
                              >
                                <Text
                                  style={
                                    styles.txBadgeText
                                  }
                                >
                                  {tx.items.reduce(
                                    (
                                      sum: number,
                                      item: any
                                    ) =>
                                      sum +
                                      item.qty,
                                    0
                                  )}{" "}
                                  pcs
                                </Text>
                              </View>
                            )}
                        </View>

                        <Text style={styles.txDate}>
                          {tx.date}
                        </Text>

                        {isExpanded && (
                          <View
                            style={
                              styles.txExpandedDetail
                            }
                          >
                            {tx.items.map(
                              (
                                item: any,
                                i: number
                              ) => (
                                <View
                                  key={i}
                                  style={
                                    styles.txDetailRow
                                  }
                                >
                                  <Text
                                    style={
                                      styles.txDetailItem
                                    }
                                  >
                                    {item.productName} x{" "}
                                    {item.qty}
                                  </Text>

                                  <Text
                                    style={
                                      styles.txDetailPrice
                                    }
                                  >
                                    {formatRupiah(
                                      item.subtotal ??
                                        0
                                    )}
                                  </Text>
                                </View>
                              )
                            )}

                            <View
                              style={[
                                styles.txDetailRow,
                                {
                                  marginTop: 6,
                                },
                              ]}
                            >
                              <Text
                                style={
                                  styles.txDetailItem
                                }
                              >
                                Total
                              </Text>

                              <Text
                                style={
                                  styles.txDetailPriceHighlight
                                }
                              >
                                {formatRupiah(
                                  tx.total
                                )}
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

                    {index <
                      transactions.length - 1 && (
                      <View
                        style={styles.txSeparator}
                      />
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
            <Text style={styles.addButtonText}>
              + Tambah Produk ke Penjualan
            </Text>
          </TouchableOpacity>

          {/* Checkout */}
          {cartItems.length > 0 && (
            <TouchableOpacity
              style={[
                styles.submitButton,
                { marginTop: 12 },
              ]}
              onPress={handleSubmitSale}
              activeOpacity={0.85}
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
        onRequestClose={() =>
          setModalVisible(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setModalVisible(false)
          }
        >
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalCartIcon}>
              <Ionicons
                name="cart-outline"
                size={36}
                color="#ccc"
              />
            </View>

            <Text style={styles.modalTitle}>
              Catat Produk Terjual
            </Text>

            <Text style={styles.modalSubtitle}>
              Catat Produksi disini Biar Sistem
              Kamu Up To Date
            </Text>

            <Text style={styles.fieldLabel}>
              Pilih Produk
            </Text>

            <TouchableOpacity
              style={styles.dropdownField}
              onPress={() =>
                setDropdownOpen(!dropdownOpen)
              }
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dropdownText,
                  selectedProduct &&
                    styles.dropdownTextSelected,
                ]}
              >
                {selectedProduct?.name ||
                  "-- Pilih Produk --"}
              </Text>

              <Ionicons
                name="chevron-down"
                size={16}
                color="#bbb"
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
                  >
                    <Text
                      style={
                        styles.dropdownItemText
                      }
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.fieldLabel}>
              Jumlah Produk
            </Text>

            <TextInput
              style={styles.inputField}
              placeholder="Contoh : 0"
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              value={jumlah}
              onChangeText={setJumlah}
            />

            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.85}
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
    paddingHorizontal: 20,
    paddingTop:
      Platform.OS === "android" ? 12 : 8,
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
    backgroundColor:
      "rgba(255,255,255,0.35)",
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

  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
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

  addButton: {
    backgroundColor: PINK_BUTTON,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
  },

  addButtonText: {
    color: RED_PRIMARY,
    fontWeight: "700",
    fontSize: 15,
  },

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
  },

  submitButtonText: {
    color: WHITE,
    fontWeight: "700",
    fontSize: 15,
  },

  txCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
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