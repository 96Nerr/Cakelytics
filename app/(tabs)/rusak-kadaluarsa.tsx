import React, { useState, useCallback } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";

const BASE_URL = "http://192.168.254.103:5000/api";

type Alasan = "Kadaluarsa" | "Rusak";

type Produk = {
  idProduk: number;
  namaProduk: string;
  stok: number;
  hargaModal: number;
  hargaJual: number;
};

type RusakItem = {
  idRusak: number;
  jumlahRusak: number;
  alasan: Alasan;
  catatan?: string;
  tanggal?: string;
  tanggalRusak?: string;
  createdAt?: string;
  produk?: {
    namaProduk: string;
  };
};

const PINK_DARK = "#FF6B97";
const PINK_LIGHT = "#FFF5F7";
const WHITE = "#FFFFFF";

export default function RusakKadaluarsaScreen() {
  const router = useRouter();

  const [items, setItems] = useState<RusakItem[]>([]);
  const [products, setProducts] = useState<Produk[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produk | null>(null);
  const [jumlahInput, setJumlahInput] = useState("");
  const [alasanInput, setAlasanInput] = useState<Alasan | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const fetchRusakItems = async () => {
    try {
      const response = await fetch(`${BASE_URL}/barang-rusak`);
      if (!response.ok) throw new Error("Gagal mengambil data");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Gagal ambil data barang rusak:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/produk`);
      if (!response.ok) throw new Error("Gagal mengambil produk");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Gagal ambil produk:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
      fetchRusakItems();
    }, [])
  );

  const resetModal = () => {
    setSelectedProduct(null);
    setJumlahInput("");
    setAlasanInput(null);
    setNoteInput("");
    setDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!selectedProduct || !jumlahInput || !alasanInput) {
      Alert.alert("Peringatan", "Lengkapi semua data terlebih dahulu!");
      return;
    }

    const targetIdProduk = parseInt(String(selectedProduct.idProduk), 10);
    const jumlah = parseInt(jumlahInput, 10);

    if (isNaN(targetIdProduk)) {
      Alert.alert("Peringatan", "ID Produk tidak valid, silakan pilih ulang produk!");
      return;
    }

    if (isNaN(jumlah) || jumlah <= 0) {
      Alert.alert("Peringatan", "Jumlah barang harus berupa angka valid dan lebih dari 0!");
      return;
    }

    if (jumlah > selectedProduct.stok) {
      Alert.alert("Peringatan", `Jumlah rusak melebihi stok yang ada! (Maksimal: ${selectedProduct.stok} pcs)`);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/barang-rusak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idProduk: targetIdProduk,
          jumlahRusak: jumlah,
          alasan: alasanInput,
          keterangan: noteInput,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setModalVisible(false);
        resetModal();
        fetchRusakItems();
        fetchProducts();
        Alert.alert("Sukses", "Data berhasil disimpan dan stok global berkurang!");
      } else {
        Alert.alert("Gagal Menyimpan", result.error || "Gagal mencatat barang rusak");
      }
    } catch (error) {
      Alert.alert("Error", "Koneksi ke server terputus!");
    }
  };

  const handleDelete = (idRusak: number) => {
    Alert.alert("Hapus Data", "Apakah Anda yakin ingin menghapus data ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${BASE_URL}/barang-rusak/${idRusak}`, {
              method: "DELETE",
            });
            if (response.ok) {
              fetchRusakItems();
              fetchProducts();
            } else {
              Alert.alert("Gagal", "Tidak dapat menghapus data");
            }
          } catch (error) {
            Alert.alert("Error", "Koneksi terputus");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={PINK_DARK} />
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={[PINK_DARK, PINK_LIGHT]} style={{ flex: 1 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Image source={require("../../assets/images/logo-cakelitycs.png")} style={styles.logo} />
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>PENJUALAN</Text>
          <Ionicons name="cart-outline" size={24} color="#ffffff" style={{ marginLeft: 6 }} />
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/cart")}>
            <Text style={styles.tabText}>Catat Jual</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, styles.tabActive]}>
            <Text style={[styles.tabText, styles.tabTextActive]}>Rusak/Kadaluarsa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/riwayat")}>
            <Text style={styles.tabText}>Riwayat</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.mainCard}>
            <Text style={styles.cardTitle}>Daftar Produk Rusak / Kadaluarsa</Text>
            {items.length === 0 ? (
              <View style={styles.emptyArea}>
                <Text style={styles.emptyText}>Belum ada data barang rusak atau kadaluarsa.</Text>
              </View>
            ) : (
              <View style={styles.itemList}>
                {items.map((item) => {
                  const tanggalMentah = item.tanggal || item.createdAt || item.tanggalRusak;
                  const tanggalFormat = tanggalMentah ? new Date(tanggalMentah).toLocaleDateString("id-ID") : "-";

                  return (
                    <View key={item.idRusak} style={styles.itemRow}>
                      <View style={styles.itemLeft}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.produk?.namaProduk || "Produk Tidak Diketahui"}
                        </Text>
                        <View style={styles.qtyBadge}>
                          <Text style={styles.qtyBadgeText}>{item.jumlahRusak} pcs</Text>
                        </View>
                      </View>

                      <View style={styles.itemCenter}>
                        <Text style={styles.itemDate}>{tanggalFormat}</Text>
                        <Text style={[styles.reasonText, item.alasan === "Rusak" ? styles.reasonRusak : styles.reasonExpired]}>
                          {item.alasan || "Rusak"}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(item.idRusak)}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={14} color={WHITE} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.mainButton} onPress={() => setModalVisible(true)} activeOpacity={0.9}>
            <Text style={styles.mainButtonText}>+ Catat Produk Rusak / Kadaluarsa</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* MODAL FORM INPUT */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetModal();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Pressable style={styles.bsOverlay} onPress={() => setModalVisible(false)}>
            <Pressable style={styles.bsContainer} onPress={(e) => e.stopPropagation()}>
              <LinearGradient
                colors={["#FFFFFF", "#FFF5F7"]}
                style={[StyleSheet.absoluteFillObject, { borderTopLeftRadius: 28, borderTopRightRadius: 28 }]}
              />

              <View style={styles.bsHandle} />
              <Text style={styles.modalTitle}>Tambah Produk Rusak / Kadaluarsa</Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 30 }}
              >
                <Text style={styles.fieldLabel}>Pilih Produk</Text>
                <TouchableOpacity
                  style={styles.dropdownField}
                  onPress={() => setDropdownOpen(!dropdownOpen)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownText, selectedProduct && styles.dropdownTextSelected]} numberOfLines={1}>
                    {selectedProduct ? selectedProduct.namaProduk : "Pilih item produk"}
                  </Text>
                  <Ionicons name={dropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="#8A6871" />
                </TouchableOpacity>

                <Text style={styles.fieldLabel}>Jumlah Barang</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Masukkan jumlah item..."
                  placeholderTextColor="#B0A0A5"
                  keyboardType="numeric"
                  value={jumlahInput}
                  onChangeText={setJumlahInput}
                />

                <Text style={styles.fieldLabel}>Alasan Kategori</Text>
                <View style={styles.alasanRow}>
                  <TouchableOpacity
                    style={[styles.alasanBtn, alasanInput === "Rusak" && styles.alasanBtnActive]}
                    onPress={() => setAlasanInput("Rusak")}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.alasanText, alasanInput === "Rusak" && styles.alasanTextActive]}>Rusak</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.alasanBtn, alasanInput === "Kadaluarsa" && styles.alasanBtnActive]}
                    onPress={() => setAlasanInput("Kadaluarsa")}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.alasanText, alasanInput === "Kadaluarsa" && styles.alasanTextActive]}>Kadaluarsa</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.fieldLabel}>Catatan / Keterangan</Text>
                <TextInput
                  style={[styles.inputField, styles.noteInput]}
                  placeholder="Tambahkan keterangan rasa/kondisi (opsional)..."
                  placeholderTextColor="#B0A0A5"
                  multiline={true}
                  value={noteInput}
                  onChangeText={setNoteInput}
                />

                <TouchableOpacity style={styles.modalButton} onPress={handleSubmit} activeOpacity={0.8}>
                  <Text style={styles.modalButtonText}>Simpan Data</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setModalVisible(false); resetModal(); }} activeOpacity={0.6}>
                  <Text style={{ textAlign: "center", marginTop: 16, color: '#8A6871', fontWeight: '600', fontSize: 14 }}>Batal</Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Dropdown List Container */}
              {dropdownOpen && (
                <View style={styles.dropdownListContainer}>
                  <FlatList
                    data={products}
                    keyExtractor={(item) => item.idProduk.toString()}
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
                        <Text style={styles.dropdownItemText}>
                          {item.namaProduk} (Stok: {item.stok})
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  headerRow: { marginBottom: 2, alignItems: "flex-start" },
  logo: { width: 120, height: 35, resizeMode: "contain" },
  sectionRow: { flexDirection: "row", alignItems: "center", marginTop: 2, marginBottom: 15 },
  sectionTitle: { fontSize: 24, fontWeight: "800", color: "white" },
  tabBar: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 50, padding: 4, marginBottom: 20 },
  tabItem: { flex: 1, paddingVertical: 10, borderRadius: 50, alignItems: "center" },
  tabActive: { backgroundColor: WHITE, elevation: 3, shadowColor: "#4A1525", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  tabText: { fontSize: 12, color: "#FFE3EB", fontWeight: "600", textAlign: "center" },
  tabTextActive: { color: "#4A1525", fontWeight: "700" },
  scrollContent: { paddingBottom: 40 },
  mainCard: { backgroundColor: WHITE, borderRadius: 24, padding: 20, marginBottom: 24, elevation: 3, shadowColor: "#4A1525", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#4A1525", marginBottom: 16 },
  emptyArea: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 13, color: "#8A6871", textAlign: "center", fontWeight: "500" },
  itemList: { marginBottom: 4 },
  itemRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF5F7", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, borderWidth: 1, borderColor: "#FFEBF0" },
  itemLeft: { flex: 1.8, alignItems: "flex-start" },
  itemCenter: { flex: 1.4, alignItems: "flex-end", marginRight: 12 },
  itemName: { fontSize: 14, fontWeight: "700", color: "#4A1525", marginBottom: 4 },
  qtyBadge: { backgroundColor: "#FFF0F2", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  qtyBadgeText: { fontSize: 11, color: "#FF6B97", fontWeight: "700" },
  itemDate: { fontSize: 12, color: "#8A6871", marginBottom: 3, fontWeight: "500" },
  reasonText: { fontSize: 11, fontWeight: "700", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  reasonRusak: { backgroundColor: "#FFEBEB", color: "#E05A6A" },
  reasonExpired: { backgroundColor: "#FFF3E0", color: "#E67E22" },
  deleteBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#E05A6A", alignItems: "center", justifyContent: "center", elevation: 1 },
  mainButton: { backgroundColor: "#FF6B97", borderRadius: 24, paddingVertical: 16, alignItems: "center", elevation: 3, shadowColor: "#4A1525", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  mainButtonText: { color: WHITE, fontWeight: "700", fontSize: 15 },
  bsOverlay: { flex: 1, backgroundColor: "rgba(74, 21, 37, 0.4)", justifyContent: "flex-end" },
  bsContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "android" ? 24 : 36,
    maxHeight: "80%",
    shadowColor: "#4A1525",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
    position: "relative"
  },
  bsHandle: { width: 40, height: 4, backgroundColor: "#FFEBF0", borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 15, color: "#4A1525", textAlign: "center" },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#8A6871", marginBottom: 6, marginTop: 14 },
  dropdownField: { borderWidth: 1, borderColor: "#FFEBF0", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: WHITE },
  dropdownText: { fontSize: 13, color: "#B0A0A5", fontWeight: "500", flex: 1 },
  dropdownTextSelected: { color: "#4A1525", fontWeight: "600" },
  inputField: { borderWidth: 1, borderColor: "#FFEBF0", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: "#4A1525", backgroundColor: WHITE },
  noteInput: { height: 80, textAlignVertical: "top", paddingTop: 12 },
  alasanRow: { flexDirection: "row", gap: 12, marginVertical: 4 },
  alasanBtn: { flex: 1, paddingVertical: 12, borderRadius: 16, alignItems: "center", backgroundColor: WHITE, borderWidth: 1, borderColor: "#FFEBF0" },
  alasanBtnActive: { backgroundColor: "#FFF0F2", borderColor: "#FF6B97" },
  alasanText: { fontSize: 13, color: "#8A6871", fontWeight: "600" },
  alasanTextActive: { color: "#FF6B97", fontWeight: "700" },
  modalButton: { backgroundColor: "#FF6B97", borderRadius: 24, paddingVertical: 14, alignItems: "center", marginTop: 24, elevation: 2 },
  modalButtonText: { color: WHITE, fontWeight: "700", fontSize: 15 },
  dropdownListContainer: { position: "absolute", top: 120, left: 24, right: 24, backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: "#FFEBF0", maxHeight: 200, zIndex: 999, elevation: 5 },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#FFF5F7" },
  dropdownItemText: { fontSize: 13, color: "#4A1525", fontWeight: "500" }
});