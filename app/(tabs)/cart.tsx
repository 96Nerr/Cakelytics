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

const BASE_URL = "http://192.168.110.115:5000/api";

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

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    await fetchProducts();
    await fetchTransactions();
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/produk`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Gagal ambil produk:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/transaksi`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Gagal ambil transaksi:", error);
    }
  };

  const handleSubmitSale = async () => {
    if (!selectedProduct || !jumlah) {
      Alert.alert("Warning", "Pilih produk dan isi jumlah!");
      return;
    }

    const qty = Number(jumlah);
    const totalHarga = selectedProduct.hargaJual * qty;

    try {
      const response = await fetch(`${BASE_URL}/transaksi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPenjualan: totalHarga,
          detailPesanan: [
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
        fetchTransactions();
        fetchProducts();
      } else {
        Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan");
      }
    } catch (error) {
      Alert.alert("Error", "Koneksi terputus");
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
          {transactions.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyTitle}>Penjualan Masih Kosong</Text>
            </View>
          ) : (
            <View style={styles.txCard}>
              <View style={styles.txDateHeader}>
                <Text style={styles.txTodayLabel}>Riwayat Terakhir</Text>
              </View>

              {transactions.map((tx, index) => {
                const isExpanded = expandedTrxId === tx.idTransaksi;
                const firstDetail = tx.detailPenjualan?.[0];
                
                return (
                  <View key={tx.idTransaksi}>
                    <TouchableOpacity style={styles.txRow} onPress={() => toggleExpand(tx.idTransaksi)}>
                      <View style={styles.txLeft}>
                        <View style={styles.txNameRow}>
                          <Text style={styles.txName}>{firstDetail?.produk?.namaProduk || "Produk"}</Text>
                          {isExpanded && (
                             <View style={styles.txBadge}><Text style={styles.txBadgeText}>{firstDetail?.jumlah} pcs</Text></View>
                          )}
                        </View>
                        <Text style={styles.txDate}>{new Date(tx.tanggalTransaksi).toLocaleDateString("id-ID")}</Text>
                        
                        {isExpanded && (
                          <View style={styles.txExpandedDetail}>
                            {tx.detailPenjualan.map((item, i) => (
                              <View key={i} style={styles.txDetailRow}>
                                <Text style={styles.txDetailItem}>{item.produk?.namaProduk} x {item.jumlah}</Text>
                                <Text style={styles.txDetailPrice}>{formatRupiah(item.subtotal)}</Text>
                              </View>
                            ))}
                            <View style={{ marginTop: 5, borderTopWidth: 1, borderColor: '#eee', paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontWeight: 'bold' }}>TOTAL</Text>
                                <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>{formatRupiah(tx.totalPenjualan)}</Text>
                            </View>
                          </View>
                        )}
                      </View>
                      {!isExpanded && <Text style={styles.txTotal}>{formatRupiah(tx.totalPenjualan)}</Text>}
                    </TouchableOpacity>
                    {index < transactions.length - 1 && <View style={styles.txSeparator} />}
                  </View>
                );
              })}
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

      <Modal visible={modalVisible} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    {/* Gunakan Pressable hanya untuk area luar saja */}
    <Pressable 
      style={StyleSheet.absoluteFill} 
      onPress={() => { setModalVisible(false); setDropdownOpen(false); }} 
    />
    
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>Catat Terjual</Text>
      
      <Text style={styles.fieldLabel}>Pilih Produk</Text>
      
      {/* Container Dropdown */}
      <View style={{ zIndex: 5000 }}>
        <TouchableOpacity 
          style={styles.dropdownField} 
          onPress={() => setDropdownOpen(!dropdownOpen)}
          activeOpacity={0.7}
        >
          <Text style={{ color: selectedProduct ? "#333" : "#bbb", flex: 1 }}>
            {selectedProduct?.namaProduk || "-- Pilih Produk --"}
          </Text>
          <Ionicons name={dropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="#666" />
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownList}>
            {/* Pakai ScrollView dengan props yang dipaksa agar menangkap touch */}
            <ScrollView 
              style={{ maxHeight: 150 }} 
              nestedScrollEnabled={true} 
              keyboardShouldPersistTaps="always" // Ubah jadi always agar sentuhan langsung ditangkap
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {products.map((item) => (
                <TouchableOpacity 
                  key={item.idProduk} 
                  style={styles.dropdownItem} 
                  onPress={() => { 
                    setSelectedProduct(item); 
                    setDropdownOpen(false); 
                  }}
                >
                  <Text style={{ fontSize: 14 }}>
                    {item.namaProduk} <Text style={{ color: '#888', fontSize: 12 }}>(Stok: {item.stok})</Text>
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Bagian Input Jumlah */}
      <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Jumlah</Text>
      <TextInput 
        style={styles.inputField} 
        keyboardType="numeric" 
        value={jumlah} 
        onChangeText={setJumlah} 
        placeholder="0" 
      />
      
      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmitSale} 
        activeOpacity={0.8}
      >
        <Text style={styles.submitButtonText}>Simpan</Text>
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
});