import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

type Tab = "catat" | "rusak" | "riwayat";
type NavItem = "home" | "box" | "cart" | "chart" | "layers";

export default function PenjualanScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("catat");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [activeNav, setActiveNav] = useState<NavItem>("cart");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const tabs: { key: Tab; label: string }[] = [
    { key: "catat", label: "Catat Jual" },
    { key: "rusak", label: "Rusak / Kadaluarsa" },
    { key: "riwayat", label: "Riwayat" },
  ];

  const navItems: { key: NavItem; icon: React.ReactNode }[] = [
    {
      key: "home",
      icon: (
        <Ionicons
          name="home-outline"
          size={22}
          color={activeNav === "home" ? "#E05A6A" : "#aaa"}
        />
      ),
    },
    {
      key: "box",
      icon: (
        <Feather
          name="box"
          size={22}
          color={activeNav === "box" ? "#E05A6A" : "#aaa"}
        />
      ),
    },
    {
      key: "cart",
      icon: <Ionicons name="cart-outline" size={24} color="#fff" />,
    },
    {
      key: "chart",
      icon: (
        <Ionicons
          name="bar-chart-outline"
          size={22}
          color={activeNav === "chart" ? "#E05A6A" : "#aaa"}
        />
      ),
    },
    {
      key: "layers",
      icon: (
        <Feather
          name="layers"
          size={22}
          color={activeNav === "layers" ? "#E05A6A" : "#aaa"}
        />
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8848D" />

      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={["#E8848D", "#FAD8DB"]} style={{ flex: 1 }} />
      </View>

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>
            Cak<Text style={styles.appTitleDot}>e</Text>litycs
          </Text>
        </View>

        {/* Section Title */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>PENJUALAN</Text>
          <Ionicons
            name="cart-outline"
            size={20}
            color="#333"
            style={{ marginLeft: 6 }}
          />
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                activeTab === tab.key && styles.tabItemActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Empty Cart Card */}
          <View style={styles.card}>
            <View style={styles.cartIllustration}>
              <Ionicons name="cart-outline" size={64} color="#ccc" />
            </View>
            <Text style={styles.emptyTitle}>Keranjang Masih Kosong</Text>
            <Text style={styles.emptySubtitle}>
              Tap tombol dibawah untuk menambahkan produk
            </Text>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.addButtonText}>
              + Tambah Produk ke Keranjang
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Bottom Navigation <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => setActiveNav(item.key)}
            activeOpacity={0.7}
          >
            {item.key === "cart" ? (
              <View style={styles.navCartCircle}>{item.icon}</View>
            ) : (
              item.icon
            )}
          </TouchableOpacity>
        ))}
      </View> */}
      

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal cart icon */}
            <View style={styles.modalCartIcon}>
              <Ionicons name="cart-outline" size={36} color="#ccc" />
            </View>

            <Text style={styles.modalTitle}>Input Produk Terjual</Text>
            <Text style={styles.modalSubtitle}>
              Catat Produksi disini Biar Sistem Kamu Up To Date
            </Text>

            {/* Pilih Produk */}
            <Text style={styles.fieldLabel}>Pilih Produk</Text>
            <TouchableOpacity
              style={styles.dropdownField}
              onPress={() => setDropdownOpen(!dropdownOpen)}
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
              <Ionicons name="chevron-down" size={16} color="#bbb" />
            </TouchableOpacity>

            {/* Jumlah Produk */}
            <Text style={styles.fieldLabel}>Jumlah Produk</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Contoh : 0"
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              value={jumlah}
              onChangeText={setJumlah}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.85}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.submitButtonText}>Tambah Produk Terjual</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const PINK_DARK = "#E8848D";
const PINK_MID = "#F0A0A8";
const PINK_LIGHT = "#FAD8DB";
const PINK_BUTTON = "#F2B4B8";
const RED_PRIMARY = "#E05A6A";
const WHITE = "#FFFFFF";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 12 : 8,
  },
  header: {
    marginBottom: 2,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2a2a2a",
    letterSpacing: 0.3,
  },
  appTitleDot: {
    color: RED_PRIMARY,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2a2a2a",
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 50,
    padding: 4,
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 50,
    alignItems: "center",
  },
  tabItemActive: {
    backgroundColor: WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  tabTextActive: {
    color: "#2a2a2a",
    fontWeight: "700",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#c06070",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 24,
  },
  cartIllustration: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2a2a2a",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    lineHeight: 19,
  },
  addButton: {
    backgroundColor: PINK_BUTTON,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#c06070",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: RED_PRIMARY,
    fontWeight: "700",
    fontSize: 15,
  },

  // Bottom Nav
  bottomNav: {
    flexDirection: "row",
    backgroundColor: WHITE,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  navCartCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: RED_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: RED_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    marginTop: -18,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  modalCartIcon: {
    alignItems: "center",
    marginBottom: 12,
    opacity: 0.5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 20,
    lineHeight: 18,
  },
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
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fafafa",
  },
  dropdownText: {
    fontSize: 14,
    color: "#bbb",
    flex: 1,
  },
  dropdownTextSelected: {
    color: "#333",
  },
  inputField: {
    borderWidth: 1.5,
    borderColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
    backgroundColor: "#fafafa",
  },
  submitButton: {
    backgroundColor: RED_PRIMARY,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: RED_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  submitButtonText: {
    color: WHITE,
    fontWeight: "700",
    fontSize: 15,
  },
});