import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// GANTI DENGAN IP LAPTOPMU
const BASE_URL = "http://192.168.1.28:5000/api";

export default function Product() {
  const [products, setProducts] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [hpp, setHpp] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  // AMBIL DATA
  useEffect(() => {
    fetchProducts();
    const interval = setInterval(() => {
      fetchProducts();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // GET PRODUK
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/produk`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Gagal mengambil data produk");
    }
  };

  // FILTER SEARCH
  const filteredProducts = products.filter((p) =>
    p.namaProduk.toLowerCase().includes(search.toLowerCase())
  );

  // SIMPAN PRODUK
  const saveProduct = async () => {
    if (!name || !hpp || !hargaJual) {
      Alert.alert("Warning", "Semua field wajib diisi");
      return;
    }

    try {
      if (editId) {
        // EDIT
        await fetch(`${BASE_URL}/produk/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            namaProduk: name,
            hargaModal: Number(hpp),
            hargaJual: Number(hargaJual),
          }),
        });
      } else {
        // TAMBAH
        await fetch(`${BASE_URL}/produk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            namaProduk: name,
            hargaModal: Number(hpp),
            hargaJual: Number(hargaJual),
            stok: 0,
          }),
        });
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Gagal menyimpan produk");
    }
  };

  // RESET
  const resetForm = () => {
    setName("");
    setHpp("");
    setHargaJual("");
    setEditId(null);
    setModalVisible(false);
  };

  // DELETE
  const deleteProduct = async (idProduk: number) => {
    try {
      await fetch(`${BASE_URL}/produk/${idProduk}`, { method: "DELETE" });
      fetchProducts();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Gagal menghapus produk");
    }
  };

  // EDIT
  const handleEdit = (item: any) => {
    setName(item.namaProduk);
    setHpp(item.hargaModal.toString());
    setHargaJual(item.hargaJual.toString());
    setEditId(item.idProduk);
    setModalVisible(true);
  };

  return (
    <LinearGradient colors={["#e65994", "#FFFFFF"]} style={styles.container}>
      {/* APP NAME */}
      <Text style={styles.appName}>Cakelytics</Text>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>KELOLA PRODUK</Text>
        <Feather name="box" size={20} color="#fff" />
      </View>

      {/* SEARCH */}
      <TextInput
        placeholder="Cari produk"
        placeholderTextColor="#A0A0A0"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      {/* EMPTY */}
      {filteredProducts.length === 0 && (
        <Text style={styles.emptyText}>Belum ada produk</Text>
      )}

      {/* LIST */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.idProduk.toString()}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const keuntungan = item.hargaJual - item.hargaModal;
          const margin =
            item.hargaModal > 0
              ? ((keuntungan / item.hargaModal) * 100).toFixed(0)
              : "0";

          return (
            <View style={styles.card}>
              {/* TOP */}
              <View style={styles.cardTop}>
                <Text style={styles.productName} numberOfLines={1}>
                  {item.namaProduk}
                </Text>
                <View style={styles.iconRow}>
                  <TouchableOpacity onPress={() => handleEdit(item)} activeOpacity={0.7}>
                    <Text style={styles.edit}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteProduct(item.idProduk)} activeOpacity={0.7}>
                    <Text style={styles.delete}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* HARGA */}
              <View style={styles.priceRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>HPP: Rp {item.hargaModal.toLocaleString()}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>JUAL: Rp {item.hargaJual.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.line} />

              {/* INFO */}
              <View style={styles.infoRow}>
                <View style={styles.infoColumn}>
                  <Text style={styles.label}>STOK</Text>
                  <Text style={[styles.value, { color: item.stok > 0 ? "#2c2c2c" : "#FF5C5C" }]}>
                    {item.stok}
                  </Text>
                </View>

                <View style={styles.infoColumn}>
                  <Text style={styles.label}>MARGIN</Text>
                  <Text style={styles.value}>{margin}%</Text>
                </View>

                <View style={styles.infoColumn}>
                  <Text style={styles.label}>UNTUNG</Text>
                  <Text style={[styles.value, { color: "#2E7D32" }]}>
                    Rp {keuntungan.toLocaleString()}
                  </Text>
                </View>

                <View
                  style={[
                    styles.available,
                    {
                      backgroundColor: item.stok > 0 ? "#E2FCDA" : "#FFEAEA",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.availableText,
                      { color: item.stok > 0 ? "#2E7D32" : "#C62828" },
                    ]}
                  >
                    {item.stok > 0 ? "READY" : "KOSONG"}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
        <Feather name="plus" size={18} color="white" style={{ marginRight: 6 }} />
        <Text style={styles.addText}>Tambah Produk</Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editId ? "Edit Detail Produk" : "Tambah Produk Baru"}
            </Text>

            <Text style={styles.labelInput}>Nama Produk</Text>
            <TextInput
              placeholder="Contoh : Soft Cookies"
              placeholderTextColor="#C7C7CC"
              style={styles.inputRounded}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.labelInput}>Harga Pokok Penjualan (HPP)</Text>
            <TextInput
              placeholder="Rp 0"
              placeholderTextColor="#C7C7CC"
              keyboardType="numeric"
              style={styles.inputRounded}
              value={hpp}
              onChangeText={setHpp}
            />

            <Text style={styles.labelInput}>Harga Jual</Text>
            <TextInput
              placeholder="Rp 0"
              placeholderTextColor="#C7C7CC"
              keyboardType="numeric"
              style={styles.inputRounded}
              value={hargaJual}
              onChangeText={setHargaJual}
            />

            <TouchableOpacity
              style={styles.submitButtonRounded}
              onPress={saveProduct}
              activeOpacity={0.8}
            >
              <Text style={styles.submitText}>
                {editId ? "Simpan Perubahan" : "Simpan Produk"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={resetForm} activeOpacity={0.6}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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

  iconBox: {
    fontSize: 18,
  },

  search: {
    backgroundColor: "white",
    borderRadius: 14, 
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2c2c2c",
    marginBottom: 16,
    shadowColor: "#703e4b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },

  emptyText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 60,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18, 
    padding: 16, 
    marginBottom: 14,
    shadowColor: "#703e4b", 
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#2c2c2c", 
    flex: 1,
    paddingRight: 8,
  },

  iconRow: {
    flexDirection: "row",
    gap: 8,
  },

  edit: {
    fontSize: 14,
    backgroundColor: "#E2FCDA", 
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
  },

  delete: {
    fontSize: 14,
    backgroundColor: "#FFEAEA", 
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },

  badge: {
    backgroundColor: "#F5F5F7", 
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#555",
  },

  line: {
    height: 1,
    backgroundColor: "#F2F2F7", 
    marginVertical: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  infoColumn: {
    alignItems: "flex-start",
  },

  label: {
    fontSize: 10,
    color: "#8E8E93", 
    fontWeight: "600",
    marginBottom: 2,
  },

  value: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2c2c2c",
  },

  available: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },

  availableText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  addButton: {
    position: "absolute",
    bottom: 24, 
    alignSelf: "center",
    backgroundColor: "#FF5C5C",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50, 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF5C5C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  addText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)", 
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "88%",
    backgroundColor: "#FFFFFF", 
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  modalTitle: {
    fontWeight: "800",
    fontSize: 18,
    color: "#1c1c1e",
    marginBottom: 12,
  },

  labelInput: {
    fontSize: 12,
    fontWeight: "600",
    color: "#48484A",
    marginBottom: 6,
    marginTop: 12,
  },

  inputRounded: {
    backgroundColor: "#FAFAFC", 
    borderRadius: 12, 
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    fontSize: 14,
    color: "#2c2c2c",
  },

  submitButtonRounded: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 50, 
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  submitText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  cancelText: {
    textAlign: "center",
    marginTop: 14,
    color: "#8E8E93",
    fontWeight: "600",
    fontSize: 13,
  },
});