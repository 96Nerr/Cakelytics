import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
type Alasan = "Kadaluarsa" | "Rusak";

interface RusakItem {
  id: string;
  name: string;
  jumlah: number;
  date: string;
  alasan: Alasan;
}

// ─── Dummy product list for dropdown ─────────────────────────────────────────
const PRODUCT_OPTIONS = [
  "Blackforest Cake",
  "Red Velvet Slice",
  "Lemon Chiffon",
  "Tiramisu",
  "Soft Cookies",
  "Truffle",
];

// ─── Theme ───────────────────────────────────────────────────────────────────
const PINK_DARK = "#E8848D";
const PINK_LIGHT = "#FAD8DB";
const RED_PRIMARY = "#E05A6A";
const WHITE = "#FFFFFF";

// ─────────────────────────────────────────────────────────────────────────────
export default function RusakKadaluarsaScreen() {
  const router = useRouter();

  // ── Real data list (starts empty → kondisi 1) ──────────────────────────────
  const [items, setItems] = useState<RusakItem[]>([]);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [jumlahInput, setJumlahInput] = useState("");
  const [alasanInput, setAlasanInput] = useState<Alasan | null>(null);
  const [noteInput, setNoteInput] = useState("");

  // ── Derived stats ─────────────────────────────────────────────────────────
  const produkRusak = items
    .filter((d) => d.alasan === "Rusak")
    .reduce((s, d) => s + d.jumlah, 0);
  const produkKadaluarsa = items
    .filter((d) => d.alasan === "Kadaluarsa")
    .reduce((s, d) => s + d.jumlah, 0);
  const totalProduk = produkRusak + produkKadaluarsa;

  const hasData = items.length > 0;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getFormattedDate = () => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  };

  const resetModal = () => {
    setSelectedProduct("");
    setJumlahInput("");
    setAlasanInput(null);
    setNoteInput("");
    setDropdownOpen(false);
  };

  const handleSubmit = () => {
    if (!selectedProduct || !jumlahInput || !alasanInput) return;
    const qty = parseInt(jumlahInput, 10);
    if (isNaN(qty) || qty <= 0) return;

    const newItem: RusakItem = {
      id: Date.now().toString(),
      name: selectedProduct,
      jumlah: qty,
      date: getFormattedDate(),
      alasan: alasanInput,
    };

    setItems((prev) => [newItem, ...prev]);
    resetModal();
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={PINK_DARK} />

      {/* Gradient background */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={[PINK_DARK, PINK_LIGHT]} style={{ flex: 1 }} />
      </View>

      <View style={styles.container}>
        {/* ── Header ── */}
        <Text style={styles.appTitle}>
          Cak<Text style={styles.appTitleAccent}>e</Text>litycs
        </Text>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>PENJUALAN</Text>
          <Ionicons
            name="cart-outline"
            size={18}
            color="#333"
            style={{ marginLeft: 6 }}
          />
        </View>

        {/* ── Tabs ── */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push("/(tabs)/cart")}
            activeOpacity={0.8}
          >
            <Text style={styles.tabText}>Catat Jual</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, styles.tabActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, styles.tabTextActive]}>
              Rusak/Kadaluarsa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push("/(tabs)/riwayat")}
            activeOpacity={0.8}
          >
            <Text style={styles.tabText}>Riwayat</Text>
          </TouchableOpacity>
        </View>

        {/* ── Scroll Content ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ══════════════════════════════════════
              MAIN CARD
          ══════════════════════════════════════ */}
          <View style={styles.mainCard}>
            <Text style={styles.cardTitle}>
              Daftar Produk Rusak / Kadaluarsa
            </Text>

            {/* ── KONDISI 1: Empty state ── */}
            {!hasData && (
              <View style={styles.emptyArea}>
                {/* Box + exclamation icon */}
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="cube-outline" size={42} color="#D0A0A8" />
                  <View style={styles.emptyExclaim}>
                    <Text style={styles.emptyExclaimText}>!</Text>
                  </View>
                </View>
                <Text style={styles.emptyText}>
                  Belum ada produk rusak/kadaluarsa
                </Text>
              </View>
            )}

            {/* ── KONDISI 2: Data list ── */}
            {hasData && (
              <View style={styles.itemList}>
                {items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    {/* Left: name + jumlah */}
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemSub}>Jumlah : {item.jumlah}</Text>
                    </View>

                    {/* Center: date + alasan */}
                    <View style={styles.itemCenter}>
                      <Text style={styles.itemDate}>{item.date}</Text>
                      <Text style={styles.itemSub}>Alasan : {item.alasan}</Text>
                    </View>

                    {/* Right: delete */}
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(item.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash-outline" size={14} color={WHITE} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* ── Stats row (always visible) ── */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{produkRusak}</Text>
                <Text style={styles.statLabel}>Produk Rusak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{produkKadaluarsa}</Text>
                <Text style={styles.statLabel}>Produk Kadaluarsa</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{totalProduk}</Text>
                <Text style={styles.statLabel}>Total Produk</Text>
              </View>
            </View>
          </View>

          {/* ── CTA Button ── */}
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.mainButtonText}>
              + Catat Produk Rusak / Kadaluarsa
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ══════════════════════════════════════════════
          MODAL — Input produk rusak/kadaluarsa
      ══════════════════════════════════════════════ */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          resetModal();
        }}
      >
        <Pressable
          style={styles.bsOverlay}
          onPress={() => {
            setModalVisible(false);
            resetModal();
          }}
        >
          <Pressable
            style={styles.bsContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <View style={styles.bsHandle} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Warning box */}
              <View style={styles.warningBox}>
                <MaterialIcons
                  name="warning-amber"
                  size={18}
                  color={RED_PRIMARY}
                  style={{ marginRight: 8 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.warningTitle}>
                    Catat Produk Rusak / Kadaluarsa
                  </Text>
                  <Text style={styles.warningDesc}>
                    Stok akan dikurangi dan dicatat sebagai kerugian berdasarkan
                    harga pokok. Karena tidak semua kue berakhir bahagia, tapi
                    keuanganmu tetap harus tercatat.
                  </Text>
                </View>
              </View>

              {/* Pilih Produk */}
              <Text style={styles.fieldLabel}>Pilih Produk</Text>
              <TouchableOpacity
                style={styles.dropdownField}
                onPress={() => setDropdownOpen((v) => !v)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    selectedProduct ? styles.dropdownTextSelected : null,
                  ]}
                >
                  {selectedProduct || "-- Pilih Produk --"}
                </Text>
                <Ionicons
                  name={dropdownOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#bbb"
                />
              </TouchableOpacity>

              {dropdownOpen && (
                <View style={styles.dropdownList}>
                  {PRODUCT_OPTIONS.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedProduct(p);
                        setDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Jumlah */}
              <Text style={styles.fieldLabel}>Jumlah</Text>
              <TextInput
                style={styles.inputField}
                value={jumlahInput}
                onChangeText={setJumlahInput}
                keyboardType="numeric"
                placeholder="Contoh : 3"
                placeholderTextColor="#bbb"
              />

              {/* Alasan */}
              <Text style={styles.fieldLabel}>Alasan</Text>
              <View style={styles.alasanRow}>
                {(["Kadaluarsa", "Rusak"] as Alasan[]).map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={[
                      styles.alasanBtn,
                      alasanInput === a && styles.alasanBtnActive,
                    ]}
                    onPress={() => setAlasanInput(a)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.alasanText,
                        alasanInput === a && styles.alasanTextActive,
                      ]}
                    >
                      {a}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Note */}
              <Text style={styles.fieldLabel}>Note (Opsional)</Text>
              <TextInput
                style={[styles.inputField, styles.noteInput]}
                value={noteInput}
                onChangeText={setNoteInput}
                multiline
                numberOfLines={3}
                placeholder="Tambahkan catatan..."
                placeholderTextColor="#bbb"
              />

              {/* Submit */}
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  (!selectedProduct || !jumlahInput || !alasanInput) &&
                    styles.modalButtonDisabled,
                ]}
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.modalButtonText}>
                  Catat Produk Rusak / Kadaluarsa
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 12 : 8,
  },

  // ── Header ──
  appTitle: { fontSize: 22, fontWeight: "800", color: "#2a2a2a" },
  appTitleAccent: { color: RED_PRIMARY },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2a2a2a",
    letterSpacing: 1,
  },

  // ── Tabs ──
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 50,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 50,
    alignItems: "center",
  },
  tabActive: { backgroundColor: WHITE },
  tabText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  tabTextActive: { color: "#2a2a2a", fontWeight: "700" },

  // ── Scroll ──
  scrollContent: { paddingBottom: 32 },

  // ── Main card ──
  mainCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#c06070",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2a2a2a",
    marginBottom: 12,
  },

  // ── Empty state ──
  emptyArea: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyIconWrap: {
    position: "relative",
    marginBottom: 12,
  },
  emptyExclaim: {
    position: "absolute",
    right: -10,
    top: -6,
    backgroundColor: RED_PRIMARY,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyExclaimText: {
    color: WHITE,
    fontWeight: "800",
    fontSize: 13,
    lineHeight: 20,
  },
  emptyText: { fontSize: 13, color: "#bbb", textAlign: "center" },

  // ── Item list ──
  itemList: { marginBottom: 8 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDEDF0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  itemLeft: { flex: 1 },
  itemCenter: { flex: 1, alignItems: "flex-end", marginRight: 8 },
  itemName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2a2a2a",
    marginBottom: 2,
  },
  itemDate: { fontSize: 11, color: "#888", marginBottom: 2 },
  itemSub: { fontSize: 11, color: "#888" },
  deleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: RED_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Stats ──
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FDE8EA",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    marginHorizontal: 3,
  },
  statNum: { fontSize: 20, fontWeight: "800", color: "#2a2a2a" },
  statLabel: { fontSize: 10, color: "#888", textAlign: "center", marginTop: 2 },

  // ── CTA button ──
  mainButton: {
    backgroundColor: RED_PRIMARY,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: RED_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  mainButtonText: { color: WHITE, fontWeight: "700", fontSize: 14 },

  // ══ BOTTOM SHEET ══════════════════════════════
  bsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  bsContainer: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "android" ? 24 : 36,
    maxHeight: "88%",
  },
  bsHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },

  // ── Modal fields ──
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FDE8EA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: RED_PRIMARY,
    marginBottom: 4,
  },
  warningDesc: { fontSize: 11, color: "#888", lineHeight: 17 },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },

  dropdownField: {
    borderWidth: 1.5,
    borderColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fafafa",
    marginBottom: 6,
  },
  dropdownText: { fontSize: 13, color: "#bbb", flex: 1 },
  dropdownTextSelected: { color: "#333" },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    backgroundColor: WHITE,
    marginBottom: 14,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  dropdownItemText: { fontSize: 13, color: "#333" },

  inputField: {
    borderWidth: 1.5,
    borderColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: "#333",
    backgroundColor: "#fafafa",
    marginBottom: 14,
  },
  noteInput: { height: 80, textAlignVertical: "top" },

  alasanRow: { flexDirection: "row", marginBottom: 14, gap: 10 },
  alasanBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#eee",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  alasanBtnActive: { borderColor: RED_PRIMARY, backgroundColor: "#FDE8EA" },
  alasanText: { fontSize: 13, color: "#aaa", fontWeight: "600" },
  alasanTextActive: { color: RED_PRIMARY },

  modalButton: {
    backgroundColor: RED_PRIMARY,
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
    shadowColor: RED_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalButtonDisabled: { opacity: 0.45 },
  modalButtonText: { color: WHITE, fontWeight: "700", fontSize: 14 },
});
