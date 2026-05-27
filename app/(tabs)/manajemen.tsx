import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Pressable,
  Image
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons"; 
import { useFocusEffect } from "expo-router";

const BASE_URL = "http://192.168.254.103:5000/api";

const PINK_PRIMARY = "#FF6B97";
const PINK_LIGHT = "#FFF5F7";
const DARK_TEXT = "#4A1525";
const MUTED_TEXT = "#8A6871";
const WHITE = "#FFFFFF";

export default function ManajemenStock() {
  const [products, setProducts] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockInput, setStockInput] = useState("");
  const [search, setSearch] = useState("");

  useFocusEffect(
    useCallback(() => {
      fetchProducts(); 
    }, [])
  );

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/produk`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Gagal mengambil produk");
    }
  };

  const filteredProducts = products.filter((item) =>
    item.namaProduk?.toLowerCase().includes(search.toLowerCase())
  );

  const addStock = async () => {
    if (!selectedProduct) {
      Alert.alert("Pilih Produk", "Silahkan pilih produk terlebih dahulu");
      return;
    }
    if (!stockInput) {
      Alert.alert("Jumlah Kosong", "Masukkan jumlah produksi");
      return;
    }

    try {
      const newStock = selectedProduct.stok + Number(stockInput);
      await fetch(`${BASE_URL}/produk/${selectedProduct.idProduk}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaProduk: selectedProduct.namaProduk,
          hargaModal: selectedProduct.hargaModal,
          hargaJual: selectedProduct.hargaJual,
          stok: newStock,
        }),
      });

      Alert.alert("Berhasil", "Stock berhasil ditambahkan");
      fetchProducts();
      setModalVisible(false);
      setSelectedProduct(null);
      setStockInput("");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Gagal menambah stock");
    }
  };

  const stockColor = (stock: number = 0) => {
    if (stock <= 0) return "#FF5252"; 
    if (stock < 5) return "#FFA000";  
    return "#2E9E5B";                 
  };

  const getBadgeStatus = (stock: number = 0) => {
    if (stock <= 0) return { label: "KOSONG", bgColor: "#FFEBEE", textColor: "#FF5252" };
    if (stock < 5) return { label: "MENIPIS", bgColor: "#FFF8E1", textColor: "#FFA000" };
    return { label: "SIAP JUAL", bgColor: "#EAF7EE", textColor: "#2E9E5B" };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PINK_PRIMARY} />

      {/* HEADER CARD STICKY FIXED DI ATAS */}
      <View style={styles.headerBox}>
        <Image 
          source={require("../../assets/images/logo-cakelitycs.png")} 
          style={styles.logoImageWhite} 
          resizeMode="contain"
        />
        <Text style={styles.title}>MANAJEMEN STOK 📦</Text>
        <Text style={styles.totalProduct}>{products.length} Produk terdaftar</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoNumber}>{products.length}</Text>
            <Text style={styles.infoLabel}>Total</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoNumberYellow}>
              {products.filter((item) => item.stok > 0 && item.stok < 5).length}
            </Text>
            <Text style={styles.infoLabel}>Menipis</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoNumberRed}>
              {products.filter((item) => item.stok <= 0).length}
            </Text>
            <Text style={styles.infoLabel}>Habis</Text>
          </View>
        </View>
      </View>

      {/* LIST DENGAN LOGIKA REVERSE STICKY */}
      <FlatList
        data={[{ isAlert: true }, ...filteredProducts]}
        keyExtractor={(item, index) => item.idProduk ? item.idProduk.toString() : `alert-${index}`}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]} // Mengunci elemen pertama (Warning Card)
        contentContainerStyle={{ paddingBottom: 140 }}
        
        // KOTAK SEARCH (Bisa di-scroll hilang ke atas)
        ListHeaderComponent={
          <View style={{ backgroundColor: PINK_LIGHT, paddingTop: 12 }}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color={MUTED_TEXT} style={styles.searchIcon} />
              <TextInput
                placeholder="Cari produk kue..."
                placeholderTextColor="#B0A0A5"
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>
        }

        renderItem={({ item }) => {
          // Render Warning Card sebagai elemen lengket (Sticky)
          if (item.isAlert) {
            const hasRedAlert = products.some((p) => p.stok <= 0);
            const hasYellowAlert = products.some((p) => p.stok > 0 && p.stok < 5);
            
            if (!hasRedAlert && !hasYellowAlert) return null;

            return (
              <View style={styles.stickyAlertWrapper}>
                {hasRedAlert && (
                  <View style={styles.redAlert}>
                    <Text style={styles.redAlertText}>
                      ⓧ Ada produk yang kehabisan stok! Segera jadwalkan produksi baru.
                    </Text>
                  </View>
                )}

                {hasYellowAlert && (
                  <View style={styles.yellowAlert}>
                    <Text style={styles.yellowAlertText}>
                      ⚠ Beberapa stok kue mulai menipis. Harap pantau sisa penjualan.
                    </Text>
                  </View>
                )}
              </View>
            );
          }

          // Render Item Kue biasa
          const status = getBadgeStatus(item.stok);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{item.namaProduk}</Text>
                  <View style={styles.priceBadgeRow}>
                    <Text style={styles.priceText}>HPP: Rp {item.hargaModal?.toLocaleString()}</Text>
                    <Text style={[styles.priceText, { marginLeft: 12 }]}>Jual: Rp {item.hargaJual?.toLocaleString()}</Text>
                  </View>
                </View>
                <View style={[styles.statusIndicator, { backgroundColor: stockColor(item.stok) }]} />
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: stockColor(item.stok),
                      width: item.stok > 15 ? "100%" : item.stok > 5 ? "70%" : item.stok > 0 ? "25%" : "0%",
                    },
                  ]}
                />
              </View>

              <View style={styles.bottomRow}>
                <View>
                  <Text style={styles.stockLabel}>STOK TERSEDIA</Text>
                  <Text style={[styles.stockNumber, { color: stockColor(item.stok) }]}>
                    {item.stok} <Text style={{ fontSize: 13, fontWeight: "500", color: MUTED_TEXT }}>pcs</Text>
                  </Text>
                </View>
                <View style={[styles.produksiBadge, { backgroundColor: status.bgColor }]}>
                  <Text style={[styles.produksiText, { color: status.textColor }]}>{status.label}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* FLOATING BUTTON */}
      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.82}
        onPress={() => setModalVisible(true)}
        hitSlop={{ top: 15, bottom: 15, left: 20, right: 20 }}
      >
        <Ionicons name="add-circle-outline" size={20} color="#1E442B" style={{ marginRight: 6 }} />
        <Text style={styles.floatingText}>Input Produksi Baru</Text>
      </TouchableOpacity>

      {/* MODAL INPUT */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Input Produksi Baru</Text>
              <Text style={styles.modalSubtitle}>Catat hasil produksi dapur di sini agar sistem pergudangan tetap akurat.</Text>

              <Text style={styles.label}>Pilih Produk Kue</Text>
              <View style={styles.pickerWrapper}>
                <RNPickerSelect
                  placeholder={{ label: "-- Klik untuk pilih produk --", value: null, color: "#B0A0A5" }}
                  onValueChange={(value) => {
                    const product = products.find((item) => item.idProduk === value);
                    setSelectedProduct(product);
                  }}
                  items={products.map((item) => ({
                    label: `${item.namaProduk} (Sisa Stok: ${item.stok})`,
                    value: item.idProduk,
                  }))}
                  style={{ inputIOS: styles.pickerInput, inputAndroid: styles.pickerInput }}
                />
              </View>

              <Text style={styles.label}>Jumlah Produksi Baru (Pcs)</Text>
              <TextInput
                placeholder="Contoh : 15"
                placeholderTextColor="#B0A0A5"
                keyboardType="numeric"
                style={styles.input}
                value={stockInput}
                onChangeText={setStockInput}
              />

              <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={addStock}>
                <Text style={styles.saveText}>Tambah Stok Produksi</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PINK_LIGHT },
  headerBox: { backgroundColor: PINK_PRIMARY, paddingTop: Platform.OS === "ios" ? 50 : 45, paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, zIndex: 10 },
  logoImageWhite: { width: 130, height: 36, marginLeft: -4, marginBottom: 6 },
  title: { color: WHITE, fontSize: 15, fontWeight: "700", letterSpacing: 0.8 },
  totalProduct: { marginTop: 4, marginBottom: 16, fontSize: 13, color: "#FFF2F5", fontWeight: "500" },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoCard: { backgroundColor: WHITE, width: "31%", borderRadius: 16, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "#FFEBF0", ...Platform.select({ ios: { shadowColor: "#4A1525", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }, android: { elevation: 2 } }) },
  infoNumber: { fontSize: 22, fontWeight: "bold", color: "#2E9E5B" },
  infoNumberYellow: { fontSize: 22, fontWeight: "bold", color: "#FFA000" },
  infoNumberRed: { fontSize: 22, fontWeight: "bold", color: "#FF5252" },
  infoLabel: { marginTop: 3, fontSize: 11, fontWeight: "600", color: DARK_TEXT },
  stickyAlertWrapper: { backgroundColor: PINK_LIGHT, paddingBottom: 10 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: WHITE, marginHorizontal: 15, marginBottom: 4, borderRadius: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: "#FFEBF0", ...Platform.select({ ios: { shadowColor: "#4A1525", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 5 }, android: { elevation: 2 } }) },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: Platform.OS === "ios" ? 14 : 11, fontSize: 14, color: DARK_TEXT, fontWeight: "500" },
  redAlert: { backgroundColor: "#FFEBEE", marginHorizontal: 15, marginTop: 8, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: "#FFCDD2" },
  redAlertText: { color: "#C62828", fontWeight: "600", fontSize: 11 },
  yellowAlert: { backgroundColor: "#FFF8E1", marginHorizontal: 15, marginTop: 8, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: "#FFE082" },
  yellowAlertText: { color: "#F57F17", fontWeight: "600", fontSize: 11 },
  card: { backgroundColor: WHITE, marginHorizontal: 15, marginTop: 12, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#FFEBF0", ...Platform.select({ ios: { shadowColor: "#4A1525", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 8 }, android: { elevation: 2 } }) },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  productName: { fontSize: 17, fontWeight: "700", color: DARK_TEXT },
  priceBadgeRow: { flexDirection: "row", marginTop: 4 },
  priceText: { fontSize: 11, color: MUTED_TEXT, fontWeight: "600" },
  statusIndicator: { width: 12, height: 12, borderRadius: 6, marginTop: 5 },
  progressBar: { height: 7, backgroundColor: "#FFF5F7", borderRadius: 10, marginTop: 14, overflow: "hidden", borderWidth: 0.5, borderColor: "#FFEBF0" },
  progressFill: { height: "100%", borderRadius: 10 },
  bottomRow: { marginTop: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stockLabel: { color: MUTED_TEXT, fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  stockNumber: { fontSize: 24, fontWeight: "800", marginTop: -2 },
  produksiBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  produksiText: { fontWeight: "700", fontSize: 10 },
  floatingButton: { position: "absolute", bottom: 30, alignSelf: "center", backgroundColor: "#D4F4E0", flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 30, borderWidth: 1, borderColor: "#B2E8C5", ...Platform.select({ ios: { shadowColor: "#1E442B", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6 }, android: { elevation: 4 } }) },
  floatingText: { color: "#1E442B", fontWeight: "700", fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(74, 21, 37, 0.4)" },
  modalBox: { width: "100%", backgroundColor: WHITE, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 24, paddingBottom: Platform.OS === "ios" ? 40 : 25 },
  modalHandle: { width: 40, height: 5, backgroundColor: "#E0D0D5", borderRadius: 3, alignSelf: "center", marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: DARK_TEXT },
  modalSubtitle: { fontSize: 12, color: MUTED_TEXT, marginBottom: 18, marginTop: 2, fontWeight: "500" },
  label: { fontSize: 14, fontWeight: "700", color: DARK_TEXT, marginBottom: 8 },
  pickerWrapper: { borderWidth: 1.5, borderColor: "#FFEBF0", borderRadius: 14, backgroundColor: "#FFF5F7", marginBottom: 16, overflow: "hidden" },
  pickerInput: { paddingVertical: 1, paddingHorizontal: 10, color: DARK_TEXT, fontSize: 10, fontWeight: "600" },
  input: { borderWidth: 1.5, borderColor: "#FFEBF0", borderRadius: 14, padding: 13, backgroundColor: "#FFF5F7", marginBottom: 20, fontSize: 14, color: DARK_TEXT, fontWeight: "600" },
  saveButton: { backgroundColor: "#E05A6A", padding: 15, borderRadius: 30, alignItems: "center", ...Platform.select({ ios: { shadowColor: "#E05A6A", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5 }, android: { elevation: 3 } }) },
  saveText: { color: WHITE, fontWeight: "700", fontSize: 15 },
});