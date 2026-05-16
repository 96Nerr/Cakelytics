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

<<<<<<< HEAD
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
=======
  const formatRupiah = (amount: number) => {
    return (
      "Rp " +
      amount.toLocaleString("id-ID", {
        minimumFractionDigits: 0,
      })
    );
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9
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
<<<<<<< HEAD
      <StatusBar barStyle="dark-content" backgroundColor="#E8848D" />

      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={["#E8848D", "#FAD8DB"]} style={{ flex: 1 }} />
=======
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
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9
      </View>

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>
            Cak<Text style={styles.appTitleDot}>e</Text>lytics
          </Text>
        </View>

        {/* Section Title */}
<<<<<<< HEAD
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>PENJUALAN</Text>
=======
        <View style={styles.headerRow}>
          <Text style={styles.title}>PENJUALAN</Text>

>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9
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
<<<<<<< HEAD
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
=======
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
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9
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

<<<<<<< HEAD
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
=======
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
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9
          )}
        </ScrollView>
      </View>

      {/* ══════════════════════════════════════════
          BOTTOM SHEET — Pilih Produk
      ══════════════════════════════════════════ */}
      <Modal
        visible={bottomSheetVisible}
        transparent
<<<<<<< HEAD
        animationType="slide"
        onRequestClose={() => setBottomSheetVisible(false)}
      >
        <Pressable
          style={styles.bsOverlay}
          onPress={() => setBottomSheetVisible(false)}
=======
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9
        >
          <Pressable
            style={styles.bsContainer}
            onPress={(e) => e.stopPropagation()}
          >
<<<<<<< HEAD
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
=======
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
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9
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
<<<<<<< HEAD
  safeArea: { flex: 1 },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 12 : 8,
  },

  header: { marginBottom: 2 },
=======
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
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9

  appName: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.4,
    lineHeight: 34,
  },

<<<<<<< HEAD
  appTitleDot: { color: "#E05A6A" },
=======
  appTitleDot: {
    color: WHITE,
  },
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9

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
<<<<<<< HEAD
    backgroundColor: "rgba(255,255,255,0.35)",
=======
    backgroundColor: "rgba(255, 255, 255, 0.2)",
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9
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

<<<<<<< HEAD
  tabItemActive: { backgroundColor: WHITE },
=======
  tabItemActive: {
    backgroundColor: WHITE,
    shadowColor: "#703e4b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9

  tabText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
    textAlign: "center",
  },

<<<<<<< HEAD
  tabTextActive: { color: "#2a2a2a", fontWeight: "700" },

  scrollContent: { flexGrow: 1, paddingBottom: 20 },
=======
  tabTextActive: {
    color: "#e65994",
    fontWeight: "700",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9

  // ── Empty card ──
  card: {
    backgroundColor: WHITE,
    borderRadius: 18,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
<<<<<<< HEAD
    marginBottom: 16,
  },

  cartIllustration: { marginBottom: 16, opacity: 0.6 },
=======
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
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9

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
<<<<<<< HEAD
    borderWidth: 1.5,
    borderColor: RED_PRIMARY,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.6)",
=======
    backgroundColor: PINK_BUTTON,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#e08897",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9
  },

  addButtonText: {
    color: "#b03d4c",
    fontWeight: "700",
    fontSize: 14,
  },

<<<<<<< HEAD
  // ── Total card ──
  totalCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 6,
=======
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
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
<<<<<<< HEAD
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
=======
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
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9
  },

  confirmButtonText: {
    color: WHITE,
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Transaction history ──
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

<<<<<<< HEAD
  txDateHeader: { alignItems: "center", marginBottom: 16 },

  txTodayLabel: { fontSize: 14, fontWeight: "700", color: "#2a2a2a" },

  txTodayDate: { fontSize: 11, color: "#bbb", marginTop: 2 },
=======
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
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9

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

<<<<<<< HEAD
  txName: { fontSize: 13, fontWeight: "700", color: "#2a2a2a" },

  txBadge: {
    backgroundColor: "#E05A6A",
    borderRadius: 20,
    paddingHorizontal: 8,
=======
  txName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c2c2c",
  },

  txBadge: {
    backgroundColor: "#FF5C5C",
    borderRadius: 6,
    paddingHorizontal: 6,
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9
    paddingVertical: 2,
  },

  txBadgeText: { fontSize: 10, color: WHITE, fontWeight: "700" },

<<<<<<< HEAD
  txDate: { fontSize: 11, color: "#bbb", marginBottom: 2 },

  txTotal: { fontSize: 13, fontWeight: "700", color: "#4CAF50", marginTop: 2 },

  txSeparator: { height: 1, backgroundColor: "#f0f0f0" },
=======
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
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9

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

<<<<<<< HEAD
  txDetailItem: { fontSize: 11, color: "#888", flex: 1 },

  txDetailPrice: { fontSize: 11, color: "#888", fontWeight: "600" },

  txDetailPriceHighlight: { fontSize: 12, color: "#4CAF50", fontWeight: "700" },

  // ══════════════════════════════════════════
  // BOTTOM SHEET
  // ══════════════════════════════════════════
  bsOverlay: {
=======
  txDetailItem: {
    fontSize: 12,
    color: "#48484A",
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

<<<<<<< HEAD
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
=======
  txDetailPrice: {
    fontSize: 12,
    color: "#48484A",
    fontWeight: "600",
  },

  txDetailPriceHighlight: {
    fontSize: 14,
    color: "#2E7D32",
>>>>>>> bcf45236dae82bf59d0386ccd9a4305a089a24e9
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
