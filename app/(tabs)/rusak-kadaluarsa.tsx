import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Alasan = 'Kadaluarsa' | 'Rusak';

interface RusakItem {
  id: string;
  name: string;
  jumlah: number;
  date: string;
  alasan: Alasan;
}

const DUMMY_DATA: RusakItem[] = [
  { id: '1', name: 'Soft Cookies', jumlah: 5, date: '29/04/2026', alasan: 'Rusak' },
  { id: '2', name: 'Soft Cookies', jumlah: 5, date: '28/04/2026', alasan: 'Rusak' },
  { id: '3', name: 'Soft Cookies', jumlah: 5, date: '27/04/2026', alasan: 'Kadaluarsa' },
  { id: '4', name: 'Soft Cookies', jumlah: 5, date: '25/04/2026', alasan: 'Kadaluarsa' },
];

const PINK_DARK = '#E8848D';
const PINK_LIGHT = '#FAD8DB';
const RED_PRIMARY = '#E05A6A';
const WHITE = '#FFFFFF';
const GREEN = '#4CAF50';
const RED_ICON = '#E05A6A';

export default function RusakKadaluarsaScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [jumlah, setJumlah] = useState('0');
  const [alasan, setAlasan] = useState<Alasan | null>(null);
  const [note, setNote] = useState('');

  const produkRusak = DUMMY_DATA.filter((d) => d.alasan === 'Rusak').length * 2 + 2;
  const produkKadaluarsa = DUMMY_DATA.filter((d) => d.alasan === 'Kadaluarsa').length + 1;
  const totalProduk = produkRusak + produkKadaluarsa;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={PINK_DARK} />
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.appTitle}>
          Cak<Text style={styles.appTitleAccent}>e</Text>litycs
        </Text>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>PENJUALAN</Text>
          <Ionicons name="cart-outline" size={18} color="#333" style={{ marginLeft: 6 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push('/(tabs)/cart')}
            activeOpacity={0.8}
          >
            <Text style={styles.tabText}>Catat Jual</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, styles.tabActive]} activeOpacity={0.8}>
            <Text style={[styles.tabText, styles.tabTextActive]}>Rusak / Kadaluarsa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push('/(tabs)/riwayat')}
            activeOpacity={0.8}
          >
            <Text style={styles.tabText}>Riwayat</Text>
          </TouchableOpacity>
        </View>

        {/* Main Card */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.mainCard}>
            <Text style={styles.cardTitle}>Daftar Produk Rusak / Kadaluarsa</Text>

            {DUMMY_DATA.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSub}>Jumlah : {item.jumlah}</Text>
                  <Text style={styles.itemSub}>Alasan : {item.alasan}</Text>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemDate}>{item.date}</Text>
                  <View style={styles.itemActions}>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: GREEN }]} activeOpacity={0.8}>
                      <Feather name="edit-2" size={12} color={WHITE} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: RED_ICON, marginLeft: 6 }]} activeOpacity={0.8}>
                      <Ionicons name="trash-outline" size={12} color={WHITE} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {/* Stats Row */}
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

          {/* Bottom Button */}
          <TouchableOpacity style={styles.mainButton} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
            <Text style={styles.mainButtonText}>Catat Produk Rusak / Kadaluarsa</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Warning Box */}
              <View style={styles.warningBox}>
                <MaterialIcons name="warning-amber" size={18} color={RED_PRIMARY} style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.warningTitle}>Catat Produk Rusak / Kadaluarsa</Text>
                  <Text style={styles.warningDesc}>
                    Stok akan dikurangi dan dicatat sebagai kerugian berdasarkan harga pokok. Karena tidak semua kue berakhir bahagia, tapi keuanganmu tetap harus tercatat
                  </Text>
                </View>
              </View>

              {/* Pilih Produk */}
              <Text style={styles.fieldLabel}>Pilih Produk</Text>
              <TouchableOpacity style={styles.dropdownField} activeOpacity={0.8}>
                <Text style={styles.dropdownPlaceholder}>
                  {selectedProduct || 'Pilih Produk'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#bbb" />
              </TouchableOpacity>

              {/* Jumlah */}
              <Text style={styles.fieldLabel}>Jumlah</Text>
              <TextInput
                style={styles.inputField}
                value={jumlah}
                onChangeText={setJumlah}
                keyboardType="numeric"
                placeholderTextColor="#bbb"
              />

              {/* Alasan */}
              <Text style={styles.fieldLabel}>Alasan</Text>
              <View style={styles.alasanRow}>
                <TouchableOpacity
                  style={[styles.alasanBtn, alasan === 'Kadaluarsa' && styles.alasanBtnActive]}
                  onPress={() => setAlasan('Kadaluarsa')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.alasanText, alasan === 'Kadaluarsa' && styles.alasanTextActive]}>Kadaluarsa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.alasanBtn, alasan === 'Rusak' && styles.alasanBtnActive]}
                  onPress={() => setAlasan('Rusak')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.alasanText, alasan === 'Rusak' && styles.alasanTextActive]}>Rusak</Text>
                </TouchableOpacity>
              </View>

              {/* Note */}
              <Text style={styles.fieldLabel}>Note</Text>
              <TextInput
                style={[styles.inputField, styles.noteInput]}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                placeholderTextColor="#bbb"
              />

              {/* Submit */}
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)} activeOpacity={0.85}>
                <Text style={styles.modalButtonText}>Catat Produk Rusak / Kadaluarsa</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PINK_DARK },
  bgTop: { ...StyleSheet.absoluteFillObject, backgroundColor: PINK_DARK },
  bgBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '55%', backgroundColor: PINK_LIGHT,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
  },
  appTitle: { fontSize: 22, fontWeight: '800', color: '#2a2a2a' },
  appTitleAccent: { color: RED_PRIMARY },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#2a2a2a', letterSpacing: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 50,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: { flex: 1, paddingVertical: 8, borderRadius: 50, alignItems: 'center' },
  tabActive: {
    backgroundColor: WHITE,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  tabText: { fontSize: 11, color: '#666', fontWeight: '500', textAlign: 'center' },
  tabTextActive: { color: '#2a2a2a', fontWeight: '700' },
  scrollContent: { paddingBottom: 24 },
  mainCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#c06070',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 14, elevation: 5,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#2a2a2a', marginBottom: 12 },
  itemCard: {
    backgroundColor: '#FDE8EA',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '700', color: '#2a2a2a', marginBottom: 2 },
  itemSub: { fontSize: 11, color: '#666', lineHeight: 16 },
  itemRight: { alignItems: 'flex-end', marginLeft: 8 },
  itemDate: { fontSize: 11, color: '#888', marginBottom: 6 },
  itemActions: { flexDirection: 'row' },
  iconBtn: {
    width: 24, height: 24, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  statCard: {
    flex: 1,
    backgroundColor: '#FDE8EA',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  statNum: { fontSize: 20, fontWeight: '800', color: '#2a2a2a' },
  statLabel: { fontSize: 10, color: '#888', textAlign: 'center', marginTop: 2 },
  mainButton: {
    backgroundColor: RED_PRIMARY,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: RED_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  mainButtonText: { color: WHITE, fontWeight: '700', fontSize: 14 },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: WHITE, borderRadius: 24,
    padding: 20, width: '100%', maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FDE8EA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  warningTitle: { fontSize: 13, fontWeight: '700', color: RED_PRIMARY, marginBottom: 4 },
  warningDesc: { fontSize: 11, color: '#888', lineHeight: 17 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  dropdownField: {
    borderWidth: 1.5, borderColor: '#eee', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fafafa', marginBottom: 14,
  },
  dropdownPlaceholder: { fontSize: 13, color: '#bbb' },
  inputField: {
    borderWidth: 1.5, borderColor: '#eee', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 13, color: '#333',
    backgroundColor: '#fafafa', marginBottom: 14,
  },
  noteInput: { height: 80, textAlignVertical: 'top' },
  alasanRow: { flexDirection: 'row', marginBottom: 14, gap: 10 },
  alasanBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#eee',
    borderRadius: 12, paddingVertical: 10, alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  alasanBtnActive: { borderColor: RED_PRIMARY, backgroundColor: '#FDE8EA' },
  alasanText: { fontSize: 13, color: '#aaa', fontWeight: '600' },
  alasanTextActive: { color: RED_PRIMARY },
  modalButton: {
    backgroundColor: RED_PRIMARY, borderRadius: 50,
    paddingVertical: 15, alignItems: 'center',
    marginTop: 4,
    shadowColor: RED_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  modalButtonText: { color: WHITE, fontWeight: '700', fontSize: 14 },
});
