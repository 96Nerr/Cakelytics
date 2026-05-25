import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; // Tetap ambil useRouter dari sini
import { useIsFocused } from "@react-navigation/native"; // Pindahkan useIsFocused ke sini!
import React, { useState, useEffect } from "react";
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  FlatList,
} from "react-native";

const BASE_URL = "http://192.168.254.103:5000/api";

type Tab = "catat" | "rusak" | "riwayat";

interface Product {
  idProduk: number; 
  namaProduk: string;
  hargaModal: number;
  hargaJual: number;
  stok: number;
}

interface CartItem {
  idProduk: number;
  namaProduk: string;
  hargaModal: number;
  hargaJual: number;
  jumlah: number;
  subtotal: number;
}

export default function CartScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [jumlah, setJumlah] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabs: { key: Tab; label: string; route: string }[] = [
    { key: "catat", label: "Catat Jual", route: "/cart" },
    { key: "rusak", label: "Rusak / Kadaluarsa", route: "/rusak-kadaluarsa" },
    { key: "riwayat", label: "Riwayat", route: "/riwayat" },
  ];

  useEffect(() => {
    if (isFocused) {
      fetchProducts();
    }
  }, [isFocused]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/produk`);
      if (!response.ok) throw new Error("Gagal mengambil produk");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log("Error fetchProducts:", error);
      Alert.alert("Error", "Gagal mengambil data produk dari server.");
    }
  };

  const handleAddToBag = () => {
    if (!selectedProduct || !jumlah) {
      Alert.alert("Warning", "Pilih produk dan isi jumlah!");
      return;
    }

    const qty = parseInt(jumlah, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Warning", "Jumlah harus berupa angka lebih dari 0!");
      return;
    }

    if (qty > selectedProduct.stok) {
      Alert.alert("Stok Kurang", `Stok ${selectedProduct.namaProduk} tersisa ${selectedProduct.stok} pcs.`);
      return;
    }

    const existingItemIndex = cartItems.findIndex(
      (item) => item.idProduk === selectedProduct.idProduk
    );

    const hargaJual = selectedProduct.hargaJual || 0;

    if (existingItemIndex > -1) {
      const updatedItems = [...cartItems];
      const targetItem = updatedItems[existingItemIndex];
      
      if (targetItem.jumlah + qty > selectedProduct.stok) {
        Alert.alert("Stok Kurang", `Total di keranjang tidak boleh melebihi stok (${selectedProduct.stok} pcs).`);
        return;
      }

      targetItem.jumlah += qty;
      targetItem.subtotal = Math.round(targetItem.jumlah * hargaJual);
      setCartItems(updatedItems);
    } else {
      setCartItems([
        ...cartItems,
        {
          idProduk: selectedProduct.idProduk,
          namaProduk: selectedProduct.namaProduk,
          hargaModal: selectedProduct.hargaModal || 0,
          hargaJual: hargaJual,
          jumlah: qty,
          subtotal: Math.round(hargaJual * qty),
        },
      ]);
    }

    handleCloseModal();
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Warning", "Keranjang belanja masih kosong!");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    const totalHarga = cartItems.reduce((acc, curr) => acc + curr.subtotal, 0);

    try {
      const response = await fetch(`${BASE_URL}/transaksi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPenjualan: totalHarga,
          detailPesanan: cartItems.map((item) => ({
            idProduk: item.idProduk,
            jumlah: item.jumlah,
            hargaModalSaatIni: item.hargaModal,
            hargaJualSaatIni: item.hargaJual,
            subtotal: item.subtotal,
          })),
        }),
      });

      if (response.ok) {
        Alert.alert("Sukses", "Transaksi penjualan berhasil disimpan!");
        setCartItems([]);
        fetchProducts(); 
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert("Gagal", errorData.error || "Terjadi kesalahan pada server");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Koneksi ke server gagal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return "Rp " + (amount || 0).toLocaleString("id-ID");
  };

  const totalBelanja = cartItems.reduce((acc, curr) => acc + curr.subtotal, 0);

  const handleCloseModal = () => {
    setModalVisible(false);
    setDropdownOpen(false);
    setJumlah("");
    setSelectedProduct(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B97" />
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={["#FF6B97", "#FFF5F7"]} style={{ flex: 1 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Cakelytics</Text>
        </View>

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>CATAT PENJUALAN</Text>
        </View>

        {/* Tab Menu */}
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

        {/* Keranjang Belanja */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {cartItems.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyTitle}>Keranjang Masih Kosong</Text>
              <Text style={{ fontSize: 13, color: '#8A6871', marginTop: 6, textAlign: 'center', fontWeight: "500", lineHeight: 18 }}>
                Klik tombol di bawah untuk mulai memasukkan item kue ke dalam bag belanjaan.
              </Text>
            </View>
          ) : (
            <View style={styles.txCard}>
              <View style={styles.txDateHeader}>
                <Text style={styles.txTodayLabel}>Daftar Belanja</Text>
              </View>

              {cartItems.map((item, index) => (
                <View key={`${item.idProduk}-${index}`}>
                  <View style={styles.txRow}>
                    <View style={styles.txLeft}>
                      <View style={styles.txNameRow}>
                        <Text style={styles.txName} numberOfLines={1}>{item.namaProduk}</Text>
                        <View style={styles.txBadge}>
                          <Text style={styles.txBadgeText}>{item.jumlah} pcs</Text>
                        </View>
                      </View>
                      <Text style={styles.txDate}>{formatRupiah(item.hargaJual)} / pcs</Text>
                    </View>
                    <Text style={styles.txTotal}>{formatRupiah(item.subtotal)}</Text>
                  </View>
                  {index < cartItems.length - 1 && <View style={styles.txSeparator} />}
                </View>
              ))}

              <View style={styles.summaryContainer}>
                <Text style={styles.summaryLabel}>Total Sementara</Text>
                <Text style={styles.summaryValue}>{formatRupiah(totalBelanja)}</Text>
              </View>

              <TouchableOpacity 
                style={[styles.checkoutBtn, isSubmitting && { backgroundColor: '#B0A0A5' }]} 
                onPress={handleCheckout}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={WHITE} size="small" />
                ) : (
                  <Text style={styles.checkoutBtnText}>Checkout Sekarang</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.9}
          >
            <Text style={styles.addButtonText}>+ Masukkan Item ke Keranjang</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* MODAL INPUT ITEM */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleCloseModal}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Pilih Item Kue</Text>

            {/* Field Dropdown Pemicu Klik */}
            <Text style={styles.fieldLabel}>Produk</Text>
            <TouchableOpacity
              style={styles.dropdownField}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              activeOpacity={0.7}
            >
              <Text style={{ color: selectedProduct ? '#4A1525' : '#B0A0A5', fontWeight: "500", flex: 1 }} numberOfLines={1}>
                {selectedProduct ? `${selectedProduct.namaProduk} (Stok: ${selectedProduct.stok})` : "Pilih produk"}
              </Text>
              <Ionicons name={dropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="#8A6871" />
            </TouchableOpacity>

            {/* LIST UTAMA SEKARANG PAKAI FLATLIST AGAR SCROLL BERJALAN 100% SINKRON */}
            {dropdownOpen && (
              <View style={styles.dropdownListContainer}>
                {products.length === 0 ? (
                  <View style={{ padding: 14 }}>
                    <Text style={{ color: '#8A6871', fontSize: 12, textAlign: 'center', fontWeight: "500" }}>Tidak ada produk tersedia</Text>
                  </View>
                ) : (
                  <FlatList
                    data={products}
                    keyExtractor={(item) => item.idProduk.toString()}
                    style={styles.dropdownFlatList}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedProduct(item);
                          setDropdownOpen(false);
                        }}
                      >
                        <Text style={{ color: '#4A1525', fontWeight: "500" }}>
                          {item.namaProduk} - {formatRupiah(item.hargaJual)}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            )}

            {/* Bagian input Jumlah */}
            <View style={{ marginTop: 15 }}>
              <Text style={styles.fieldLabel}>Jumlah</Text>
              <TextInput
                style={styles.inputField}
                keyboardType="numeric"
                value={jumlah}
                onChangeText={setJumlah}
                placeholder="Masukkan jumlah pesanan"
                placeholderTextColor="#B0A0A5"
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleAddToBag} activeOpacity={0.8}>
                <Text style={styles.submitButtonText}>Tambahkan ke Bag</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCloseModal} activeOpacity={0.6}>
                <Text style={{ textAlign: "center", marginTop: 16, color: '#8A6871', fontWeight: '600', fontSize: 14 }}>Batal</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const WHITE = "#FFFFFF";

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 60 },
  header: { marginBottom: 2 },
  appTitle: { fontSize: 28, fontWeight: "700", color: "#fcfcfc", letterSpacing: 0.5 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginTop: 1, marginBottom: 5 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "white" },
  tabContainer: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 50, padding: 4, marginBottom: 20 },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 50 },
  tabItemActive: { backgroundColor: WHITE, elevation: 3, shadowColor: "#4A1525", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  tabText: { fontSize: 12, color: "#FFE3EB", fontWeight: "600" },
  tabTextActive: { color: "#4A1525", fontWeight: "700" },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  card: { backgroundColor: WHITE, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 48, alignItems: "center", elevation: 3, marginBottom: 24, shadowColor: "#4A1525", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#4A1525" },
  addButton: { backgroundColor: "#FF6B97", borderRadius: 24, paddingVertical: 16, alignItems: "center", elevation: 3, shadowColor: "#4A1525", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  addButtonText: { color: WHITE, fontWeight: "700", fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(74, 21, 37, 0.4)", justifyContent: "center", alignItems: "center" },
  
  modalCard: { 
    backgroundColor: WHITE,
    borderRadius: 28, 
    padding: 24, 
    width: "90%", 
    maxWidth: 400, 
    shadowColor: "#4A1525", 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 20, 
    elevation: 10,
    position: "relative" // Menstabilkan penataan anak absolut
  },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 20, color: "#4A1525", textAlign: "center" },
  fieldLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6, color: "#8A6871" },
  dropdownField: {
    borderWidth: 1,
    borderColor: "#FFEBF0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#fff',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2
  },
  
  // PERBAIKAN TOTAL: Membatasi tinggi agar tidak meluber dari kartu putih modal
  dropdownListContainer: {
    position: 'absolute',
    top: 138, // Disesuaikan presisi di bawah kolom dropdown produk                       
    left: 24,                  
    right: 24,                 
    borderWidth: 1,
    borderColor: "#FFEBF0",
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 15, // Ditinggikan agar diprioritaskan oleh sistem Android             
    zIndex: 999, // Memastikan urutan tumpukan paling depan             
    maxHeight: 110, // Dibatasi ketat agar muat di dalam batas modal putih
    shadowColor: "#4A1525",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,          
    overflow: 'hidden'
  },
  dropdownFlatList: {
    flexGrow: 0,
  },
  dropdownItem: { 
    padding: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: "#FFEBF0",
    backgroundColor: WHITE
  },
  inputField: { borderWidth: 1, borderColor: "#FFEBF0", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24, backgroundColor: '#fff', color: '#4A1525', fontWeight: "500" },
  submitButton: { backgroundColor: "#FF6B97", borderRadius: 24, paddingVertical: 16, alignItems: "center" },
  submitButtonText: { color: WHITE, fontWeight: "700", fontSize: 15 },
  txCard: { backgroundColor: WHITE, borderRadius: 24, padding: 20, elevation: 3, marginBottom: 24, shadowColor: "#4A1525", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  txDateHeader: { alignItems: "flex-start", marginBottom: 10 },
  txTodayLabel: { fontSize: 15, fontWeight: "700", color: "#4A1525" },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  txLeft: { flex: 1, paddingRight: 10 },
  txNameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: 'wrap' },
  txName: { fontSize: 14, fontWeight: "700", flexShrink: 1, color: "#4A1525" },
  txBadge: { backgroundColor: "#FFF0F2", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  txBadgeText: { fontSize: 11, color: "#FF6B97", fontWeight: "700" },
  txDate: { fontSize: 12, color: "#8A6871", marginTop: 4, fontWeight: "500" },
  txTotal: { fontSize: 14, fontWeight: "700", color: "#4A1525" },
  txSeparator: { height: 1, backgroundColor: "#FFEBF0" },
  summaryContainer: {
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#FFEBF0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: { fontSize: 14, fontWeight: '700', color: '#4A1525' },
  summaryValue: { fontSize: 16, fontWeight: '800', color: '#2D8A4E' },
  checkoutBtn: { backgroundColor: '#2D8A4E', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginBottom: 2 },
  checkoutBtnText: { color: WHITE, fontWeight: '700', fontSize: 15 },
});