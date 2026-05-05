import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
} from "react-native";

export default function Product() {
  const [products, setProducts] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [hpp, setHpp] = useState("");
  const [hargaJual, setHargaJual] = useState("");

  const [editId, setEditId] = useState<string | null>(null);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const saveProduct = () => {
    if (!name || !hpp || !hargaJual) return;

    if (editId) {
      setProducts(
        products.map((p) =>
          p.id === editId
            ? { ...p, name, hpp: Number(hpp), hargaJual: Number(hargaJual) }
            : p
        )
      );
    } else {
      const newProduct = {
        id: Date.now().toString(),
        name,
        hpp: Number(hpp),
        hargaJual: Number(hargaJual),
      };
      setProducts([...products, newProduct]);
    }

    resetForm();
  };

  const resetForm = () => {
    setName("");
    setHpp("");
    setHargaJual("");
    setEditId(null);
    setModalVisible(false);
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleEdit = (item: any) => {
    setName(item.name);
    setHpp(item.hpp.toString());
    setHargaJual(item.hargaJual.toString());
    setEditId(item.id);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Cakelytics</Text>

      <View style={styles.headerRow}>
        <Text style={styles.title}>KELOLA PRODUK</Text>
        <Text style={styles.iconBox}>📦</Text>
      </View>

      {/* SEARCH */}
      <TextInput
        placeholder="Cari produk"
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => {
          const keuntungan = item.hargaJual - item.hpp;
          const margin = ((keuntungan / item.hpp) * 100).toFixed(0);

          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.productName}>{item.name}</Text>

                <View style={styles.iconRow}>
                  <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Text style={styles.edit}>✏️</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => deleteProduct(item.id)}>
                    <Text style={styles.delete}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.badge}>HPP : {item.hpp}</Text>
                <Text style={styles.badge}>JUAL : {item.hargaJual}</Text>
              </View>

              <View style={styles.line} />

              <View style={styles.infoRow}>
                <View>
                  <Text style={styles.label}>STOK</Text>
                  <Text style={styles.value}>9</Text>
                </View>

                <View>
                  <Text style={styles.label}>MARGIN</Text>
                  <Text style={styles.value}>{margin}%</Text>
                </View>

                <View>
                  <Text style={styles.label}>KEUNTUNGAN</Text>
                  <Text style={styles.value}>Rp.{keuntungan}</Text>
                </View>

                <Text style={styles.available}>TERSEDIA</Text>
              </View>
            </View>
          );
        }}
      />

      {/* BUTTON TAMBAH */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addText}>Tambah Produk</Text>
      </TouchableOpacity>

      {/* MODAL TENGAH */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editId ? "Edit Produk" : "Tambah Produk Baru"}
            </Text>

            <Text style={styles.labelInput}>Nama Produk</Text>
            <TextInput
              placeholder="Contoh : Soft Cookies"
              placeholderTextColor="#999"
              style={styles.inputRounded}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.labelInput}>
              Harga Pokok (HPP) per Pcs
            </Text>
            <TextInput
              placeholder="Rp. 0"
              placeholderTextColor="#999"
              style={styles.inputRounded}
              keyboardType="numeric"
              value={hpp}
              onChangeText={setHpp}
            />

            <Text style={styles.labelInput}>Harga Jual per Pcs</Text>
            <TextInput
              placeholder="Rp. 0"
              placeholderTextColor="#999"
              style={styles.inputRounded}
              keyboardType="numeric"
              value={hargaJual}
              onChangeText={setHargaJual}
            />

            <TouchableOpacity
              style={styles.submitButtonRounded}
              onPress={saveProduct}
            >
              <Text style={styles.submitText}>
                {editId ? "Update Produk" : "Tambah Produk"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.cancelText}>Batal</Text>
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
    backgroundColor: "#F26D6D",
    paddingTop: 60,
    paddingHorizontal: 15,
  },

  appName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },

  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  iconBox: {
    fontSize: 18,
  },

  search: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 12,
    marginBottom: 15,
  },

  emptyText: {
    textAlign: "center",
    color: "white",
    marginTop: 50,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  productName: {
    fontWeight: "bold",
  },

  iconRow: {
    flexDirection: "row",
    gap: 10,
  },

  edit: {
    fontSize: 16,
    backgroundColor: "#C8F7C5",
    padding: 6,
    borderRadius: 8,
  },

  delete: {
    fontSize: 16,
    backgroundColor: "#FFD6D6",
    padding: 6,
    borderRadius: 8,
  },

  priceRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  badge: {
    backgroundColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
  },

  line: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    fontSize: 10,
    color: "#666",
  },

  value: {
    fontWeight: "bold",
  },

  available: {
    backgroundColor: "#C8F7C5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 10,
  },

  addButton: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    backgroundColor: "#FF5C5C",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },

  addText: {
    color: "white",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "90%",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    padding: 20,
  },

  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 15,
  },

  labelInput: {
    fontSize: 12,
    color: "#333",
    marginBottom: 5,
    marginTop: 10,
  },

  inputRounded: {
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  submitButtonRounded: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
  },

  submitText: {
    color: "white",
    fontWeight: "bold",
  },

  cancelText: {
    textAlign: "center",
    marginTop: 10,
    color: "#999",
  },
});