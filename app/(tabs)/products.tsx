import React, { useState, useEffect } from "react";
import { Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // ✅ Ditambahkan agar sinkron dengan gradient Dashboard

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
} from "react-native";

// GANTI DENGAN IP LAPTOPMU
const BASE_URL = "http://192.168.254.103:5000/api";

export default function Product() {

  const [products, setProducts] = useState<any[]>([]);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [name, setName] =
    useState("");

  const [hpp, setHpp] =
    useState("");

  const [hargaJual, setHargaJual] =
    useState("");

  const [editId, setEditId] =
    useState<number | null>(null);

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

      const response =
        await fetch(`${BASE_URL}/produk`);

      const data =
        await response.json();

      setProducts(data);

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Error",
        "Gagal mengambil data produk"
      );
    }
  };

  // FILTER SEARCH
  const filteredProducts =
    products.filter((p) =>
      p.namaProduk
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  // SIMPAN PRODUK
  const saveProduct = async () => {

    if (!name || !hpp || !hargaJual) {

      Alert.alert(
        "Warning",
        "Semua field wajib diisi"
      );

      return;
    }

    try {

      // EDIT
      if (editId) {

        await fetch(
          `${BASE_URL}/produk/${editId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              namaProduk: name,
              hargaModal: Number(hpp),
              hargaJual: Number(hargaJual),
            }),
          }
        );

      } else {

        // TAMBAH
        await fetch(
          `${BASE_URL}/produk`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              namaProduk: name,
              hargaModal: Number(hpp),
              hargaJual: Number(hargaJual),
              stok: 0,
            }),
          }
        );
      }

      fetchProducts();

      resetForm();

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Error",
        "Gagal menyimpan produk"
      );
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
  const deleteProduct = async (
    idProduk: number
  ) => {

    try {

      await fetch(
        `${BASE_URL}/produk/${idProduk}`,
        {
          method: "DELETE",
        }
      );

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Error",
        "Gagal menghapus produk"
      );
    }
  };

  // EDIT
  const handleEdit = (item: any) => {

    setName(item.namaProduk);

    setHpp(item.hargaModal.toString());

    setHargaJual(
      item.hargaJual.toString()
    );

    setEditId(item.idProduk);

    setModalVisible(true);
  };

  return (
    // ✅ Mengganti View luar dengan LinearGradient agar sewarna dengan dashboard
    <LinearGradient colors={["#FF6B97", "#FFF5F7"]} style={styles.container}>

      {/* APP NAME */}
      <Text style={styles.appName}>
        Cakelytics
      </Text>

      {/* HEADER */}
      <View style={styles.headerRow}>

        <Text style={styles.title}>
          KELOLA PRODUK
        </Text>

        <Text style={styles.iconBox}>
          📦
        </Text>

      </View>

      {/* SEARCH */}
      <TextInput
        placeholder="Cari produk"
        placeholderTextColor="#A3888F"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      {/* EMPTY */}
      {filteredProducts.length === 0 && (

        <Text style={styles.emptyText}>
          Belum ada produk
        </Text>

      )}

      {/* LIST */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) =>
          item.idProduk.toString()
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140, // Ditinggikan sedikit agar tidak tertutup tombol tambah
        }}
        renderItem={({ item }) => {

          const keuntungan =
            item.hargaJual -
            item.hargaModal;

          const margin =
            item.hargaModal > 0
              ? (
                  (keuntungan /
                    item.hargaModal) *
                  100
                ).toFixed(0)
              : "0";

          return (

            <View style={styles.card}>

              {/* TOP */}
              <View style={styles.cardTop}>

                <Text style={styles.productName}>
                  {item.namaProduk}
                </Text>

                <View style={styles.iconRow}>

                  {/* EDIT */}
                  <TouchableOpacity
                    onPress={() =>
                      handleEdit(item)
                    }
                  >
                    <Text style={styles.edit}>
                      ✏️
                    </Text>
                  </TouchableOpacity>

                  {/* DELETE */}
                  <TouchableOpacity
                    onPress={() =>
                      deleteProduct(
                        item.idProduk
                      )
                    }
                  >
                    <Text style={styles.delete}>
                      🗑️
                    </Text>
                  </TouchableOpacity>

                </View>
              </View>

              {/* HARGA */}
              <View style={styles.priceRow}>

                <Text style={styles.badge}>
                  HPP: Rp {item.hargaModal.toLocaleString("id-ID")}
                </Text>

                <Text style={styles.badgeJual}>
                  JUAL: Rp {item.hargaJual.toLocaleString("id-ID")}
                </Text>

              </View>

              <View style={styles.line} />

              {/* INFO */}
              <View style={styles.infoRow}>

                <View>
                  <Text style={styles.label}>
                    STOK
                  </Text>

                  <Text style={styles.value}>
                    {item.stok}
                  </Text>
                </View>

                <View>
                  <Text style={styles.label}>
                    MARGIN
                  </Text>

                  <Text style={styles.value}>
                    {margin}%
                  </Text>
                </View>

                <View>
                  <Text style={styles.label}>
                    KEUNTUNGAN
                  </Text>

                  <Text style={styles.valueKeuntungan}>
                    Rp {keuntungan.toLocaleString("id-ID")}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.available,

                    {
                      backgroundColor:
                        item.stok > 0
                          ? "#FFEAEA" // Menggunakan palette soft warning dari dashboard
                          : "#FFF3CD", 
                      color: 
                        item.stok > 0
                          ? "#CC3838" 
                          : "#856404",
                    },
                  ]}
                >
                  {item.stok > 0
                    ? "TERSEDIA"
                    : "KOSONG"}
                </Text>

              </View>

            </View>
          );
        }}
      />

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.9}
        onPress={() =>
          setModalVisible(true)
        }
      >
        <Text style={styles.addText}>
          + Tambah Produk Baru
        </Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >

        <View style={styles.modalOverlay}>

          {/* ✅ Menggunakan LinearGradient pada box modal agar terlihat sangat estetik */}
          <LinearGradient colors={["#FFFFFF", "#FFF5F7"]} style={styles.modalBox}>

            <Text style={styles.modalTitle}>
              {editId
                ? "Edit Produk"
                : "Tambah Produk Baru"}
            </Text>

            <Text style={styles.labelInput}>
              Nama Produk
            </Text>

            <TextInput
              placeholder="Contoh : Soft Cookies"
              placeholderTextColor="#B0A0A5"
              style={styles.inputRounded}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.labelInput}>
              Harga Pokok Penjualan (HPP)
            </Text>

            <TextInput
              placeholder="Rp 0"
              placeholderTextColor="#B0A0A5"
              keyboardType="numeric"
              style={styles.inputRounded}
              value={hpp}
              onChangeText={setHpp}
            />

            <Text style={styles.labelInput}>
              Harga Jual
            </Text>

            <TextInput
              placeholder="Rp 0"
              placeholderTextColor="#B0A0A5"
              keyboardType="numeric"
              style={styles.inputRounded}
              value={hargaJual}
              onChangeText={setHargaJual}
            />

            <TouchableOpacity
              style={
                styles.submitButtonRounded
              }
              activeOpacity={0.8}
              onPress={saveProduct}
            >
              <Text style={styles.submitText}>
                {editId
                  ? "Update Data Produk"
                  : "Simpan Produk"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={resetForm}
              activeOpacity={0.6}
            >
              <Text style={styles.cancelText}>
                Batal
              </Text>
            </TouchableOpacity>

          </LinearGradient>

        </View>

      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },

  appName: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 10,
    marginTop: 1,
  },

  title: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
  },

  iconBox: {
    fontSize: 20,
  },

  search: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    color: "#4A1525",
    fontWeight: "500",
    shadowColor: "#4A1525",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  emptyText: {
    textAlign: "center",
    color: "#4A1525",
    opacity: 0.6,
    marginTop: 50,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#4A1525",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
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
    color: "#4A1525",
    flex: 1,
    marginRight: 10,
  },

  iconRow: {
    flexDirection: "row",
    gap: 8,
  },

  edit: {
    fontSize: 14,
    backgroundColor: "#EFFFF2",
    padding: 8,
    borderRadius: 12,
    overflow: "hidden",
  },

  delete: {
    fontSize: 14,
    backgroundColor: "#FFEAEA",
    padding: 8,
    borderRadius: 12,
    overflow: "hidden",
  },

  priceRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  badge: {
    backgroundColor: "#FFF0F2",
    color: "#A84C63",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
  },

  badgeJual: {
    backgroundColor: "#EFFFF2",
    color: "#2D8A4E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
  },

  line: {
    height: 1,
    backgroundColor: "#FFEBF0",
    marginVertical: 14,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    fontSize: 10,
    color: "#8A6871",
    fontWeight: "700",
    marginBottom: 2,
  },

  value: {
    fontWeight: "700",
    fontSize: 14,
    color: "#4A1525",
  },

  valueKeuntungan: {
    fontWeight: "700",
    fontSize: 14,
    color: "#2D8A4E",
  },

  available: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: "700",
    overflow: "hidden",
  },

  addButton: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    backgroundColor: "#FF6B97",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 24,
    shadowColor: "#4A1525",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  addText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(74, 21, 37, 0.4)", // Shadow overlay diselaraskan dengan tema Deep Berry
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "90%",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#4A1525",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  modalTitle: {
    fontWeight: "800",
    fontSize: 20,
    color: "#4A1525",
    marginBottom: 15,
    textAlign: "center",
  },

  labelInput: {
    fontSize: 12,
    color: "#8A6871",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },

  inputRounded: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#FFEBF0",
    color: "#4A1525",
    fontWeight: "500",
  },

  submitButtonRounded: {
    backgroundColor: "#FF6B97",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 24,
  },

  submitText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  cancelText: {
    textAlign: "center",
    marginTop: 16,
    color: "#8A6871",
    fontWeight: "600",
    fontSize: 14,
  },

});