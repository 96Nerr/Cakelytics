  import { Ionicons } from "@expo/vector-icons";
  import { LinearGradient } from "expo-linear-gradient";
  import { useRouter } from "expo-router";
  import React, { useState, useEffect } from "react";
  import {
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
  } from "react-native";

  const BASE_URL = "http://192.168.1.14:5000/api";

  type Tab = "catat" | "rusak" | "riwayat";

  type Transaction = {
    idTransaksi: number;
    tanggalTransaksi: string;
    totalPenjualan: number;
    detailPenjualan: {
      idDetail: number;
      jumlah: number;
      subtotal: number;
      produk: {
        namaProduk: string;
      };
    }[];
  };

  export default function PenjualanScreen() {
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [jumlah, setJumlah] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [expandedTrxId, setExpandedTrxId] = useState<number | null>(null);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const tabs: { key: Tab; label: string; route: string }[] = [
      { key: "catat", label: "Catat Jual", route: "/cart" },
      { key: "rusak", label: "Rusak / Kadaluarsa", route: "/rusak-kadaluarsa" },
      { key: "riwayat", label: "Riwayat", route: "/riwayat" },
    ];

    // 1. Ambil transaksi hari ini
    const transactionsToday = transactions;

    // 2. Bongkar detailPenjualan menjadi satu list produk yang laku hari ini
    const soldItemsToday = transactionsToday.flatMap(tx => 
      tx.detailPenjualan.map(detail => ({
      ...detail,
      tanggalTransaksi: tx.tanggalTransaksi, // Ambil jam/waktu dari transaksi induknya
      idTransaksi: tx.idTransaksi   // Tetap simpan ID transaksi buat referensi
      }))
    );

    // 3. Hitung total pendapatan (Ini untuk menjawab error 'Cannot find name totalPenjualan')
    const totalPendapatan = soldItemsToday.reduce((acc, curr) => acc + curr.subtotal, 0);

    useEffect(() => {
      fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
      await fetchProducts();
      await fetchTransactions();
    };

    const fetchProducts = async () => {
    try {
      // Tambahkan /produk jika BASE_URL berakhir di /api
      const response = await fetch(`${BASE_URL}/produk`);
      if (!response.ok) throw new Error("Gagal mengambil produk");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log("Error fetchProducts:", error);
    }
  };

  const fetchTransactions = async () => {
  try {
    const response = await fetch(`${BASE_URL}/riwayat-penjualan`);

    if (!response.ok) throw new Error("Gagal mengambil transaksi");

    const data = await response.json();

    const today = new Date().toDateString();

    const filteredToday = data.filter((tx: Transaction) => {
      const txDate = new Date(tx.tanggalTransaksi).toDateString();
      return txDate === today;
    });

    setTransactions(filteredToday);
  } catch (error) {
    console.log("Error fetchTransactions:", error);
  }
};

  const handleSubmitSale = async () => {
    if (!selectedProduct || !jumlah) {
      Alert.alert("Warning", "Pilih produk dan isi jumlah!");
      return;
    }

    const qty = Number(jumlah);
    // Pastikan hargaJual ada di selectedProduct
    const totalHarga = (selectedProduct.hargaJual || 0) * qty;

    try {
      const response = await fetch(`${BASE_URL}/transaksi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPenjualan: totalHarga,
          detailPesanan: [ // Pastikan backend kamu menerima field 'detailPesanan'
            {
              idProduk: selectedProduct.idProduk,
              jumlah: qty,
              hargaModalSaatIni: selectedProduct.hargaModal,
              hargaJualSaatIni: selectedProduct.hargaJual,
              subtotal: totalHarga
            }
          ]
        }),
      });

      if (response.ok) {
        Alert.alert("Sukses", "Penjualan berhasil dicatat!");
        setModalVisible(false);
        setJumlah("");
        setSelectedProduct(null);
        await fetchTransactions(); // Refresh data
        await fetchProducts();      // Refresh stok
      } else {
        const errorData = await response.json();
        Alert.alert("Gagal", errorData.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Koneksi ke server gagal. Cek IP Laptop Anda.");
    }
  };

    const formatRupiah = (amount: number) => {
      return "Rp. " + (amount || 0).toLocaleString("id-ID");
    };

    const toggleExpand = (id: number) => {
      setExpandedTrxId((prev) => (prev === id ? null : id));
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8848D" />
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={["#E8848D", "#FAD8DB"]} style={{ flex: 1 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Cakelitycs</Text>
        </View>

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>PENJUALAN</Text>
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

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {soldItemsToday.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyTitle}>Belum Ada Produk Terjual</Text>
              <Text style={{fontSize: 12, color: '#999', marginTop: 4}}>Data akan muncul setelah Anda mencatat penjualan.</Text>
            </View>
          ) : (
            <View style={styles.txCard}>
              <View style={styles.txDateHeader}>
                <Text style={styles.txTodayLabel}>Today</Text>
                <Text style={{fontSize: 10, color: '#bbb'}}>{new Date().toLocaleDateString("id-ID")}</Text>
              </View>

              {/* RENDER LIST PRODUK TERJUAL */}
              {soldItemsToday.map((item, index) => (
                <View key={`${item.idTransaksi}-${index}`}>
                  <View style={styles.txRow}>
                    <View style={styles.txLeft}>
                      <View style={styles.txNameRow}>
                        <Text style={styles.txName}>{item.produk?.namaProduk}</Text>
                        <View style={styles.txBadge}>
                          <Text style={styles.txBadgeText}>{item.jumlah} pcs</Text>
                        </View>
                      </View>
                      <Text style={styles.txDate}>
                        {new Date(item.tanggalTransaksi).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} • TRX{item.idTransaksi}
                      </Text>
                    </View>
                    <Text style={styles.txTotal}>{formatRupiah(item.subtotal)}</Text>
                  </View>
                  {index < soldItemsToday.length - 1 && <View style={styles.txSeparator} />}
                </View>
              ))}

              {/* RINGKASAN TOTAL HARI INI */}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryLabel}>Total Pendapatan</Text>
                <Text style={styles.summaryValue}>{formatRupiah(totalPendapatan)}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setModalVisible(true)}
            activeOpacity={0.9}
          >
            <Text style={styles.addButtonText}>+ Tambah Produk ke Penjualan</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* MODAL KAMU (Tetap sama seperti sebelumnya) */}
      <Modal visible={modalVisible} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>Tambah Penjualan</Text>

      <Text style={styles.fieldLabel}>Produk</Text>
      <TouchableOpacity
        style={styles.dropdownField}
        onPress={() => setDropdownOpen(!dropdownOpen)}
      >
        <Text>
          {selectedProduct ? selectedProduct.namaProduk : "Pilih produk"}
        </Text>
      </TouchableOpacity>

      {dropdownOpen && (
        <View style={styles.dropdownList}>
          <ScrollView>
            {products.map((item) => (
              <TouchableOpacity
                key={item.idProduk}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedProduct(item);
                  setDropdownOpen(false);
                }}
              >
                <Text>{item.namaProduk}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={styles.fieldLabel}>Jumlah</Text>
      <TextInput
        style={styles.inputField}
        keyboardType="numeric"
        value={jumlah}
        onChangeText={setJumlah}
        placeholder="Masukkan jumlah"
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitSale}>
        <Text style={styles.submitButtonText}>Simpan</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setModalVisible(false)}>
        <Text style={{ textAlign: "center", marginTop: 12 }}>Batal</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
}

const RED_PRIMARY = "#E05A6A";
const PINK_BUTTON = "#F2B4B8";
const WHITE = "#FFFFFF";

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  header: { marginBottom: 2 },
  appTitle: { fontSize: 22, fontWeight: "800", color: "#2a2a2a" },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginTop: 4, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#2a2a2a" },
  tabContainer: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.35)", borderRadius: 50, padding: 4, marginBottom: 20 },
  tabItem: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 50 },
  tabItemActive: { backgroundColor: WHITE, elevation: 3 },
  tabText: { fontSize: 12, color: "#666" },
  tabTextActive: { color: "#2a2a2a", fontWeight: "700" },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  card: { backgroundColor: WHITE, borderRadius: 20, padding: 48, alignItems: "center", elevation: 6, marginBottom: 24 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#2a2a2a" },
  addButton: { backgroundColor: PINK_BUTTON, borderRadius: 50, paddingVertical: 16, alignItems: "center", elevation: 2 },
  addButtonText: { color: RED_PRIMARY, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalCard: { backgroundColor: WHITE, borderRadius: 24, padding: 24, width: "90%"},
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  dropdownField: { 
    borderWidth: 1, 
    borderColor: "#eee", 
    borderRadius: 12, 
    padding: 13, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: '#fafafa'
  },
  dropdownList: { 
  position: 'absolute', 
  top: 52, 
  left: 0, 
  right: 0, 
  borderWidth: 1, 
  borderColor: "#eee", 
  borderRadius: 12, 
  backgroundColor: '#fff', 
  elevation: 10,       // Naikkan elevation agar di atas segalanya di Android
  zIndex: 10000,       // Naikkan zIndex untuk iOS
  maxHeight: 160,      // Batasi tinggi
},
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#f9f9f9" },
  inputField: { borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 13, marginBottom: 20, backgroundColor: '#fafafa' },
  submitButton: { backgroundColor: RED_PRIMARY, borderRadius: 50, paddingVertical: 16, alignItems: "center" },
  submitButtonText: { color: WHITE, fontWeight: "700" },
  txCard: { backgroundColor: WHITE, borderRadius: 20, padding: 20, elevation: 6, marginBottom: 24 },
  txDateHeader: { alignItems: "center", marginBottom: 16 },
  txTodayLabel: { fontSize: 14, fontWeight: "700" },
  txRow: { paddingVertical: 12 },
  txLeft: { flex: 1 },
  txNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  txName: { fontSize: 13, fontWeight: "700" },
  txBadge: { backgroundColor: RED_PRIMARY, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  txBadgeText: { fontSize: 10, color: WHITE, fontWeight: "700" },
  txDate: { fontSize: 11, color: "#bbb" },
  txTotal: { fontSize: 13, fontWeight: "700", color: "#4CAF50", textAlign: 'right' },
  txSeparator: { height: 1, backgroundColor: "#f0f0f0" },
  txExpandedDetail: { marginTop: 8, backgroundColor: "#fafafa", borderRadius: 10, padding: 10 },
  txDetailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  txDetailItem: { fontSize: 11, color: "#888" },
  txDetailPrice: { fontSize: 11, fontWeight: "600" },

  summaryContainer: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333'
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4CAF50'
  }

});