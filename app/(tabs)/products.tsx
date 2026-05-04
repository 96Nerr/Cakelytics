import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";

export default function ProductsScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>KELOLA PRODUK</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Cari produk"
        placeholderTextColor="#999"
      />

      {/* Product Cards */}
      <View style={styles.card}>
        <Text style={styles.productName}>Cheesecake Slice</Text>
        <Text>HPP: Rp. 10.000</Text>
        <Text>JUAL: Rp. 15.000</Text>
        <Text>STOK: 9</Text>
        <Text>MARGIN: 50%</Text>
        <Text>KEUNTUNGAN/PCS: Rp. 5.000</Text>
        <Text style={styles.available}>TERSEDIA</Text>
        <View style={styles.rowBetween}>
          <TouchableOpacity><Text style={styles.edit}>✏️ Edit</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.delete}>🗑️ Hapus</Text></TouchableOpacity>
        </View>
      </View>

      {/* Tambah Produk Button */}
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addText}>Tambah Produk</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // gradasi background → pink ke putih
    backgroundColor: "#FFD6E7",
    padding: 20,
  },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  available: { color: "green", fontWeight: "bold", marginTop: 5 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  edit: { color: "#007bff", fontWeight: "bold" },
  delete: { color: "red", fontWeight: "bold" },
  addButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  addText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
