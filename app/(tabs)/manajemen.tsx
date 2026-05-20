import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";

import RNPickerSelect from "react-native-picker-select";

const BASE_URL = "http://192.168.1.21:5000/api";

export default function ManajemenStock() {

  const [products, setProducts] = useState<any[]>([]);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<any>(null);

  const [stockInput, setStockInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  //ambil 
  useEffect(() => {

    fetchProducts();

    const interval = setInterval(() => {
      fetchProducts();
    }, 2000);

    return () => clearInterval(interval);

  }, []);

  // GET PRODUK
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {

    try {

      const response =
        await fetch(`${BASE_URL}/produk`);

      const data = await response.json();

      setProducts(data);

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Error",
        "Gagal mengambil produk"
      );
    }
  };

  // FILTER SEARCH
  const filteredProducts =
    products.filter((item) =>
      item.namaProduk
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  // TAMBAH STOK
  const addStock = async () => {

    if (!selectedProduct) {

      Alert.alert(
        "Pilih Produk",
        "Silahkan pilih produk terlebih dahulu"
      );

      return;
    }

    if (!stockInput) {

      Alert.alert(
        "Jumlah Kosong",
        "Masukkan jumlah produksi"
      );

      return;
    }

    try {

      const newStock =
        selectedProduct.stok +
        Number(stockInput);

      await fetch(
        `${BASE_URL}/produk/${selectedProduct.idProduk}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            namaProduk:
              selectedProduct.namaProduk,

            hargaModal:
              selectedProduct.hargaModal,

            hargaJual:
              selectedProduct.hargaJual,

            stok: newStock,
          }),
        }
      );

      Alert.alert(
        "Berhasil",
        "Stock berhasil ditambahkan"
      );

      fetchProducts();

      setModalVisible(false);

      setSelectedProduct(null);

      setStockInput("");

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Error",
        "Gagal menambah stock"
      );
    }
  };

  // WARNA STOK
  const stockColor = (stock: number) => {

    if (stock <= 0)
      return "#FF4D4D";

    if (stock < 5)
      return "#FFD43B";

    return "#69DB7C";
  };

  return (

    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.headerBox}>

        <Text style={styles.appName}>
          Cakelytics
        </Text>

        <Text style={styles.title}>
          MANAJEMEN STOK 📦
        </Text>

        <Text style={styles.totalProduct}>
          {products.length} Produk terdaftar
        </Text>

        {/* INFO CARD */}
        <View style={styles.infoRow}>

          <View style={styles.infoCard}>

            <Text style={styles.infoNumber}>
              {products.length}
            </Text>

            <Text style={styles.infoLabel}>
              Total
            </Text>

          </View>

          <View style={styles.infoCard}>

            <Text style={styles.infoNumberYellow}>
              {
                products.filter(
                  (item) =>
                    item.stok > 0 &&
                    item.stok < 5
                ).length
              }
            </Text>

            <Text style={styles.infoLabel}>
              Menipis
            </Text>

          </View>

          <View style={styles.infoCard}>

            <Text style={styles.infoNumberRed}>
              {
                products.filter(
                  (item) =>
                    item.stok <= 0
                ).length
              }
            </Text>

            <Text style={styles.infoLabel}>
              Habis
            </Text>

          </View>

        </View>

      </View>

      {/* ALERT MERAH */}
      {
        products.some(
          (item) => item.stok <= 0
        ) && (

          <View style={styles.redAlert}>

            <Text style={styles.redAlertText}>
              ⓧ Produk Habis Stock! ,
              Segera Tambahkan Produksi !
            </Text>

          </View>
        )
      }

      {/* ALERT KUNING */}
      {
        products.some(
          (item) =>
            item.stok > 0 &&
            item.stok < 5
        ) && (

          <View style={styles.yellowAlert}>

            <Text style={styles.yellowAlertText}>
              ⚠ Produk Mulai Menipis ! ,
              Buat Stock Lebih Banyak Lagi !
            </Text>

          </View>
        )
      }

      {/* SEARCH */}
      <TextInput
        placeholder="Cari produk"
        placeholderTextColor="#999"
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
      />

      {/* LIST */}
      <FlatList
        data={filteredProducts}

        keyExtractor={(item) =>
          item.idProduk.toString()
        }

        contentContainerStyle={{
          paddingBottom: 150,
        }}

        renderItem={({ item }) => (

          <View style={styles.card}>

            {/* TOP */}
            <View style={styles.cardTop}>

              <View>

                <Text style={styles.productName}>
                  {item.namaProduk}
                </Text>

                <Text style={styles.priceText}>
                  HPP : {item.hargaModal}
                </Text>

                <Text style={styles.priceText}>
                  JUAL : {item.hargaJual}
                </Text>

              </View>

              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor:
                      stockColor(item.stok),
                  },
                ]}
              />

            </View>

            {/* PROGRESS */}
            <View style={styles.progressBar}>

              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor:
                      stockColor(item.stok),

                    width:
                      item.stok > 15
                        ? "100%"
                        : item.stok > 5
                        ? "70%"
                        : item.stok > 0
                        ? "25%"
                        : "10%",
                  },
                ]}
              />

            </View>

            {/* BOTTOM */}
            <View style={styles.bottomRow}>

              <View>

                <Text style={styles.stockLabel}>
                  STOK
                </Text>

                <Text style={styles.stockNumber}>
                  {item.stok}
                </Text>

              </View>

              <View style={styles.produksiBadge}>

                <Text style={styles.produksiText}>
                  PRODUKSI
                </Text>

              </View>

            </View>

          </View>
        )}
      />

      {/* FLOATING BUTTON */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() =>
          setModalVisible(true)
        }
      >
        <Text style={styles.floatingText}>
          Input Produksi
        </Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>
              Input Produksi Baru
            </Text>

            <Text style={styles.modalSubtitle}>
              Catat Produksi disini Biar Sistem Kamu Up To Date
            </Text>

            {/* PILIH PRODUK */}
            <Text style={styles.label}>
              Pilih Produk
            </Text>

            <View style={styles.pickerWrapper}>

              <RNPickerSelect

                placeholder={{
                  label: "-- Pilih Produk --",
                  value: null,
                }}

                onValueChange={(value) => {

                  const product =
                    products.find(
                      (item) =>
                        item.idProduk === value
                    );

                  setSelectedProduct(product);
                }}

                items={products.map((item) => ({
                  label: item.namaProduk,
                  value: item.idProduk,
                }))}

                style={{
                  inputIOS: styles.pickerInput,
                  inputAndroid: styles.pickerInput,
                }}

              />

            </View>

            {/* INPUT JUMLAH */}
            <Text style={styles.label}>
              Jumlah Produksi
            </Text>

            <TextInput
              placeholder="Contoh : 0"
              placeholderTextColor="#999"
              keyboardType="numeric"
              style={styles.input}
              value={stockInput}
              onChangeText={setStockInput}
            />

            {/* BUTTON */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={addStock}
            >
              <Text style={styles.saveText}>
                Tambah Stok Produksi
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F6A9A9",
  },

  headerBox: {
    backgroundColor: "#EFA7A7",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 8,
  },

  appName: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 15,
  },

  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  totalProduct: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoCard: {
    backgroundColor: "white",
    width: "30%",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },

  infoNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#69DB7C",
  },

  infoNumberYellow: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD43B",
  },

  infoNumberRed: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF4D4D",
  },

  infoLabel: {
    marginTop: 5,
    fontWeight: "600",
  },

  redAlert: {
    backgroundColor: "#FFD6D6",
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 20,
  },

  redAlertText: {
    color: "red",
    fontWeight: "500",
  },

  yellowAlert: {
    backgroundColor: "#FFF4C2",
    marginHorizontal: 15,
    marginTop: 10,
    padding: 15,
    borderRadius: 20,
  },

  yellowAlertText: {
    color: "black",
    fontWeight: "500",
  },

  searchInput: {
    backgroundColor: "white",
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 20,
    padding: 15,
  },

  card: {
    backgroundColor: "white",
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 25,
    padding: 20,
    elevation: 5,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productName: {
    fontSize: 22,
    fontWeight: "600",
  },

  priceText: {
    fontSize: 12,
    marginTop: 2,
  },

  statusIndicator: {
    width: 22,
    height: 22,
    borderRadius: 20,
  },

  progressBar: {
    height: 10,
    backgroundColor: "#E5E5E5",
    borderRadius: 20,
    marginTop: 20,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 20,
  },

  bottomRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stockLabel: {
    color: "#777",
  },

  stockNumber: {
    fontSize: 30,
    fontWeight: "bold",
  },

  produksiBadge: {
    backgroundColor: "#C8F7C5",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },

  produksiText: {
    fontWeight: "bold",
    fontSize: 12,
  },

  // FLOATING BUTTON
  floatingButton: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "#8EF0B2",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    elevation: 5,
  },

  floatingText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  modalBox: {
    width: "90%",
    backgroundColor: "#F5F5F5",
    borderRadius: 35,
    padding: 25,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },

  modalSubtitle: {
    fontSize: 12,
    color: "#999",
    marginBottom: 20,
  },

  label: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
    marginTop: 5,
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 20,
    backgroundColor: "white",
    marginBottom: 20,
  },

  pickerInput: {
    padding: 15,
    color: "#333",
    fontSize: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 20,
    padding: 15,
    backgroundColor: "white",
    marginBottom: 20,
    fontSize: 16,
  },

  saveButton: {
    backgroundColor: "#FF6666",
    padding: 18,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 5,
  },

  saveText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },

});