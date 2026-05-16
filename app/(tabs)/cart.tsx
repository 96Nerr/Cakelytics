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

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  costPrice: number;
};

const PRODUCTS: Product[] = [
  { id: 1, name: "Blackforest Cake", price: 75000, stock: 6, costPrice: 45000 },
  {
    id: 2,
    name: "Red Velvet Slice",
    price: 32000,
    stock: 15,
    costPrice: 20000,
  },
  { id: 3, name: "Lemon Chiffon", price: 28000, stock: 20, costPrice: 16000 },
  { id: 4, name: "Tiramisu", price: 55000, stock: 8, costPrice: 35000 },
  { id: 5, name: "Soft Cookies", price: 18000, stock: 30, costPrice: 10000 },
];

export default function PenjualanScreen() {
  const router = useRouter();

  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [expandedTrxId, setExpandedTrxId] = useState<number | string | null>(
    null,
  );

  const { transactions, addTransaction } = useTransactions();
  const [cartItems, setCartItems] = useState<TransactionItem[]>([]);

  const tabs: { key: Tab; label: string; route: string }[] = [
    { key: "catat", label: "Catat Jual", route: "/cart" },
    { key: "rusak", label: "Rusak/Kadaluarsa", route: "/rusak-kadaluarsa" },
    { key: "riwayat", label: "Riwayat", route: "/riwayat" },
  ];

  const getFormattedDate = () => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  };

  const getFormattedTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  const getTodayHeader = () => getFormattedDate();

  const formatRupiah = (amount: number) =>
    "Rp " + amount.toLocaleString("id-ID", { minimumFractionDigits: 0 });

  // ── Cart Logic ────────────────────────────────────────────────────────────

  const addProductToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.price }
            : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          qty: 1,
          price: product.price,
          subtotal: product.price,
        },
      ];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((i) =>
          i.productId === productId
            ? { ...i, qty: i.qty + delta, subtotal: (i.qty + delta) * i.price }
            : i,
        )
        .filter((i) => i.qty > 0);
    });
  };

  const removeItem = (productId: number) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const cartTotal = cartItems.reduce((sum, i) => sum + i.subtotal, 0);
  const cartTotalItems = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const estimasiUntung = cartItems.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    if (!product) return sum;
    return sum + (item.price - product.costPrice) * item.qty;
  }, 0);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleConfirmSale = () => {
    if (cartItems.length === 0) return;

    trxCounter += 1;
    const total = cartTotal;

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
    setConfirmModalVisible(false);
  };

  const toggleExpand = (id: number | string) => {
    setExpandedTrxId((prev) => (prev === id ? null : Number(id)));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8848D" />

      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={["#E8848D", "#FAD8DB"]} style={{ flex: 1 }} />
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
                tab.key === "catat" && styles.tabItemActive,
              ]}
              onPress={() => {
                if (tab.key !== "catat") router.push(tab.route as any);
              }}
              activeOpacity={0.8}
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
          {/* ══════════════════════════════════════════
              KONDISI A — Belum ada transaksi sama sekali
              Tampilkan: empty state card + keranjang aktif (jika ada) + tombol tambah
          ══════════════════════════════════════════ */}
          {transactions.length === 0 && (
            <>
              {/* Empty state — hanya muncul saat keranjang juga kosong */}
              {cartItems.length === 0 && (
                <View style={styles.card}>
                  <View style={styles.cartIllustration}>
                    <Ionicons name="cart-outline" size={64} color="#ccc" />
                  </View>
                  <Text style={styles.emptyTitle}>Keranjang masih kosong</Text>
                  <Text style={styles.emptySubtitle}>
                    Tap tombol di bawah untuk menambah produk
                  </Text>
                </View>
              )}

              {/* Keranjang aktif (saat user sudah pilih produk tapi belum konfirmasi) */}
              {cartItems.length > 0 && (
                <View style={styles.cartCard}>
                  {cartItems.map((item) => (
                    <View key={item.productId} style={styles.cartItemRow}>
                      <View style={styles.cartItemIcon}>
                        <Text style={{ fontSize: 22 }}>🍰</Text>
                      </View>
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>
                          {item.productName}
                        </Text>
                        <Text style={styles.cartItemMeta}>
                          {formatRupiah(item.price)} / pcs • Stok:{" "}
                          {PRODUCTS.find((p) => p.id === item.productId)
                            ?.stock ?? "-"}
                        </Text>
                      </View>
                      <View style={styles.cartControls}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQty(item.productId, -1)}
                        >
                          <Text style={styles.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.qty}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQty(item.productId, 1)}
                        >
                          <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => removeItem(item.productId)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#bbb"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Total card */}
              {cartItems.length > 0 && (
                <View style={styles.totalCard}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalItemCount}>
                      {cartTotalItems} item
                    </Text>
                    <Text style={styles.totalProfit}>
                      Untung: {formatRupiah(estimasiUntung)}
                    </Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>
                      {formatRupiah(cartTotal)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => setConfirmModalVisible(true)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color="#fff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.confirmButtonText}>
                      Konfirmasi Penjualan
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Tombol tambah — di bawah empty state / keranjang */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setBottomSheetVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.addButtonText}>
                  + Tambah Produk ke Keranjang
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* ══════════════════════════════════════════
              KONDISI B — Sudah ada transaksi hari ini
              Tampilkan: keranjang aktif (jika ada) + list transaksi + tombol tambah di bawah
          ══════════════════════════════════════════ */}
          {transactions.length > 0 && (
            <>
              {/* Keranjang aktif — tampil di atas list transaksi */}
              {cartItems.length > 0 && (
                <>
                  <View style={styles.cartCard}>
                    {cartItems.map((item) => (
                      <View key={item.productId} style={styles.cartItemRow}>
                        <View style={styles.cartItemIcon}>
                          <Text style={{ fontSize: 22 }}>🍰</Text>
                        </View>
                        <View style={styles.cartItemInfo}>
                          <Text style={styles.cartItemName}>
                            {item.productName}
                          </Text>
                          <Text style={styles.cartItemMeta}>
                            {formatRupiah(item.price)} / pcs • Stok:{" "}
                            {PRODUCTS.find((p) => p.id === item.productId)
                              ?.stock ?? "-"}
                          </Text>
                        </View>
                        <View style={styles.cartControls}>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQty(item.productId, -1)}
                          >
                            <Text style={styles.qtyBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.qtyText}>{item.qty}</Text>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQty(item.productId, 1)}
                          >
                            <Text style={styles.qtyBtnText}>+</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => removeItem(item.productId)}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={16}
                              color="#bbb"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Total card */}
                  <View style={styles.totalCard}>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalItemCount}>
                        {cartTotalItems} item
                      </Text>
                      <Text style={styles.totalProfit}>
                        Untung: {formatRupiah(estimasiUntung)}
                      </Text>
                    </View>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalAmount}>
                        {formatRupiah(cartTotal)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={() => setConfirmModalVisible(true)}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={18}
                        color="#fff"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.confirmButtonText}>
                        Konfirmasi Penjualan
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* List transaksi hari ini */}
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
                        activeOpacity={0.7}
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
                                    0,
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
                                style={[styles.txDetailRow, { marginTop: 6 }]}
                              >
                                <Text style={styles.txDetailItem}>Total</Text>
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

              {/* Tombol tambah — di bawah list transaksi */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setBottomSheetVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.addButtonText}>
                  + Tambah Produk ke Keranjang
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>

      {/* ══════════════════════════════════════════
          BOTTOM SHEET — Pilih Produk
      ══════════════════════════════════════════ */}
      <Modal
        visible={bottomSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBottomSheetVisible(false)}
      >
        <Pressable
          style={styles.bsOverlay}
          onPress={() => setBottomSheetVisible(false)}
        >
          <Pressable
            style={styles.bsContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <View style={styles.bsHandle} />

            {/* Title row */}
            <View style={styles.bsTitleRow}>
              <Text style={styles.bsTitle}>Pilih Produk</Text>
              <TouchableOpacity onPress={() => setBottomSheetVisible(false)}>
                <Ionicons name="close" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Product list */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {PRODUCTS.map((product) => (
                <View key={product.id} style={styles.bsProductRow}>
                  {/* Icon */}
                  <View style={styles.bsProductIcon}>
                    <Text style={{ fontSize: 24 }}>🍰</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.bsProductInfo}>
                    <Text style={styles.bsProductName}>{product.name}</Text>
                    <Text style={styles.bsProductMeta}>
                      {formatRupiah(product.price)} • Stok: {product.stock}
                    </Text>
                  </View>

                  {/* Add button */}
                  <TouchableOpacity
                    style={styles.bsAddBtn}
                    onPress={() => addProductToCart(product)}
                  >
                    <Ionicons name="add" size={20} color={RED_PRIMARY} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ══════════════════════════════════════════
          MODAL — Konfirmasi Penjualan
      ══════════════════════════════════════════ */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <Pressable
          style={styles.cmOverlay}
          onPress={() => setConfirmModalVisible(false)}
        >
          <Pressable style={styles.cmCard} onPress={(e) => e.stopPropagation()}>
            {/* Emoji */}
            <Text style={styles.cmEmoji}>🎉</Text>

            <Text style={styles.cmTitle}>Konfirmasi Penjualan</Text>
            <Text style={styles.cmSubtitle}>
              {cartTotalItems} item senilai{" "}
              <Text style={{ color: RED_PRIMARY, fontWeight: "700" }}>
                {formatRupiah(cartTotal)}
              </Text>
            </Text>

            {/* Item list */}
            <View style={styles.cmItemList}>
              {cartItems.map((item) => (
                <View key={item.productId} style={styles.cmItemRow}>
                  <Text style={styles.cmItemName}>
                    {item.productName} × {item.qty}
                  </Text>
                  <Text style={styles.cmItemPrice}>
                    {formatRupiah(item.subtotal)}
                  </Text>
                </View>
              ))}

              <View style={[styles.cmItemRow, { marginTop: 8 }]}>
                <Text style={styles.cmProfitLabel}>Estimasi Untung</Text>
                <Text style={styles.cmProfitAmount}>
                  {formatRupiah(estimasiUntung)}
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.cmButtonRow}>
              <TouchableOpacity
                style={styles.cmBatalBtn}
                onPress={() => setConfirmModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cmBatalText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cmConfirmBtn}
                onPress={handleConfirmSale}
                activeOpacity={0.85}
              >
                <Text style={styles.cmConfirmText}>Ya, Konfirmasi!</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
const RED_PRIMARY = "#E8A020"; // amber/gold to match screenshot
const WHITE = "#FFFFFF";

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 12 : 8,
  },

  header: { marginBottom: 2 },

  appTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2a2a2a",
    letterSpacing: 0.3,
  },

  appTitleDot: { color: "#E05A6A" },

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

  tabItemActive: { backgroundColor: WHITE },

  tabText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },

  tabTextActive: { color: "#2a2a2a", fontWeight: "700" },

  scrollContent: { flexGrow: 1, paddingBottom: 20 },

  // ── Empty card ──
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 16,
  },

  cartIllustration: { marginBottom: 16, opacity: 0.6 },

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

  // ── Cart items card ──
  cartCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  cartItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },

  cartItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FFF5E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  cartItemInfo: { flex: 1 },

  cartItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2a2a2a",
    marginBottom: 2,
  },

  cartItemMeta: { fontSize: 11, color: "#aaa" },

  cartControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },

  qtyBtnText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "600",
    lineHeight: 20,
  },

  qtyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2a2a2a",
    minWidth: 20,
    textAlign: "center",
  },

  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },

  // ── Add button ──
  addButton: {
    borderWidth: 1.5,
    borderColor: RED_PRIMARY,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  addButtonText: {
    color: RED_PRIMARY,
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Total card ──
  totalCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 6,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalItemCount: { fontSize: 13, color: "#888" },

  totalProfit: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2a2a2a",
  },

  totalAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: RED_PRIMARY,
  },

  confirmButton: {
    backgroundColor: RED_PRIMARY,
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },

  confirmButtonText: {
    color: WHITE,
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Transaction history ──
  txCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  txDateHeader: { alignItems: "center", marginBottom: 16 },

  txTodayLabel: { fontSize: 14, fontWeight: "700", color: "#2a2a2a" },

  txTodayDate: { fontSize: 11, color: "#bbb", marginTop: 2 },

  txRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 12,
  },

  txLeft: { flex: 1, paddingRight: 12 },

  txNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },

  txName: { fontSize: 13, fontWeight: "700", color: "#2a2a2a" },

  txBadge: {
    backgroundColor: "#E05A6A",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  txBadgeText: { fontSize: 10, color: WHITE, fontWeight: "700" },

  txDate: { fontSize: 11, color: "#bbb", marginBottom: 2 },

  txTotal: { fontSize: 13, fontWeight: "700", color: "#4CAF50", marginTop: 2 },

  txSeparator: { height: 1, backgroundColor: "#f0f0f0" },

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

  txDetailItem: { fontSize: 11, color: "#888", flex: 1 },

  txDetailPrice: { fontSize: 11, color: "#888", fontWeight: "600" },

  txDetailPriceHighlight: { fontSize: 12, color: "#4CAF50", fontWeight: "700" },

  // ══════════════════════════════════════════
  // BOTTOM SHEET
  // ══════════════════════════════════════════
  bsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  bsContainer: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "android" ? 24 : 36,
    maxHeight: "75%",
  },

  bsHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },

  bsTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  bsTitle: { fontSize: 17, fontWeight: "800", color: "#2a2a2a" },

  bsProductRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBF0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },

  bsProductIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FFF0D0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  bsProductInfo: { flex: 1 },

  bsProductName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2a2a2a",
    marginBottom: 2,
  },

  bsProductMeta: { fontSize: 12, color: "#aaa" },

  bsAddBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  // ══════════════════════════════════════════
  // CONFIRM MODAL
  // ══════════════════════════════════════════
  cmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  cmCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },

  cmEmoji: { fontSize: 40, marginBottom: 8 },

  cmTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
  },

  cmSubtitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 20,
    textAlign: "center",
  },

  cmItemList: {
    width: "100%",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },

  cmItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cmItemName: { fontSize: 13, color: "#555" },

  cmItemPrice: { fontSize: 13, color: "#333", fontWeight: "600" },

  cmProfitLabel: { fontSize: 13, color: "#4CAF50", fontWeight: "600" },

  cmProfitAmount: { fontSize: 13, color: "#4CAF50", fontWeight: "700" },

  cmButtonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  cmBatalBtn: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
  },

  cmBatalText: { fontSize: 14, fontWeight: "700", color: "#555" },

  cmConfirmBtn: {
    flex: 2,
    backgroundColor: RED_PRIMARY,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
  },

  cmConfirmText: { fontSize: 14, fontWeight: "700", color: WHITE },
});
